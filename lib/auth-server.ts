import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { NextRequest } from "next/server";

export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth(request?: NextRequest) {
  const session = await getServerAuthSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function getUserId() {
  const session = await getServerAuthSession();
  return session?.user?.id;
}
