import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/prisma"; // Import Prisma client

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;

        // Find existing user in the database
        let existingUser = await db.user.findUnique({
          where: { email: user.email ?? "" },
        });

        if (!existingUser) {
          // Create user with 5 free credits if they don't exist
          existingUser = await db.user.create({
            data: {
              email: user.email ?? "",
              name: user.name,
              avatarUrl: user.image,
              credits: 5, // Assign 5 free credits to new users
              isPro: false,
            },
          });
        } else {
          // Update user info (except credits)
          existingUser = await db.user.update({
            where: { email: user.email ?? "" },
            data: { name: user.name, avatarUrl: user.image },
          });
        }

        // Attach credits to token
        token.credits = existingUser.credits;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image as string;

        // Fetch updated user details from the database
        const dbUser = await db.user.findUnique({
          where: { email: token.email ?? "" },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.name = dbUser.name;
          session.user.image = dbUser.avatarUrl;
          session.user.credits = dbUser.credits as number; // Include credits in the session
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // If url is relative, make it absolute
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If url is on the same origin, allow it
      else if (new URL(url).origin === baseUrl) return url;
      // Otherwise redirect to editor
      return `${baseUrl}/editor`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
