import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      credits?: number;
      isPro?: boolean;
      subscriptionId?: string | null;
    };
  }

  interface User {
    id: string;
    credits?: number;
    isPro?: boolean;
    subscriptionId?: string | null;
  }
}
