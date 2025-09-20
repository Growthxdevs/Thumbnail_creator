"use client";

import { SessionProvider } from "next-auth/react";
import { SaveProjectProvider } from "@/contexts/save-project-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SaveProjectProvider>{children}</SaveProjectProvider>
    </SessionProvider>
  );
}
