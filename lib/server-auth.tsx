import { getServerAuthSession } from "./auth-server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface ServerAuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export async function ServerAuthGuard({
  children,
  redirectTo = "/auth/signin",
}: ServerAuthGuardProps) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}

export async function requireServerAuth() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return session;
}
