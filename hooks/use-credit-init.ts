"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCreditStore } from "@/stores/credit-store";

export function useCreditInit() {
  const { data: session } = useSession();
  const { setCredits, credits } = useCreditStore();

  useEffect(() => {
    // Initialize credits from session when user logs in
    if (session?.user?.credits !== undefined && credits === 0) {
      setCredits(session.user.credits);
    }
  }, [session?.user?.credits, setCredits, credits]);

  return { credits };
}
