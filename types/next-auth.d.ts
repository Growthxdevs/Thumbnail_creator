import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      credits: number;
    };
  }

  interface User extends DefaultUser {
    id: string;
    avatarUrl?: string;
    credits: number;
  }
}
