"use client";

import { SessionProvider } from "next-auth/react";
import { CreditProvider } from "@/contexts/credit-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CreditProvider>{children}</CreditProvider>
    </SessionProvider>
  );
}
