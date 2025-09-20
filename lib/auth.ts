import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  useSecureCookies: process.env.NODE_ENV === "production",
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log("SignIn callback triggered:", {
          userEmail: user.email,
          provider: account?.provider,
          accountId: account?.providerAccountId,
        });

        // Check if user already exists with this email
        if (account?.provider === "google") {
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser) {
            // Check if there's already a Google account linked
            const existingAccount = await db.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: "google",
              },
            });

            if (!existingAccount) {
              // Link the Google account to existing user
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });
              console.log(
                "Linked Google account to existing user:",
                existingUser.id
              );
            }
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        // For JWT strategy, user data comes from token
        session.user.id = token.id as string;

        // Get user data from database
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { credits: true, isPro: true, subscriptionId: true },
        });

        if (dbUser) {
          session.user.credits = dbUser.credits;
          session.user.isPro = dbUser.isPro;
          session.user.subscriptionId = dbUser.subscriptionId;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // Return previous token if the access token has not expired yet
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at;
      }

      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
