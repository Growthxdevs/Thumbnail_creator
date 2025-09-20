"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCreditStore } from "@/stores/credit-store";

export function useCreditInit() {
  const { data: session } = useSession();
  const { setCredits, credits } = useCreditStore();

  useEffect(() => {
    // Initialize credits from session when user logs in
    if (session?.user?.credits !== undefined) {
      // Ensure credits are never negative (cap at 0)
      const validCredits = Math.max(0, session.user.credits);
      setCredits(validCredits);
    }
  }, [session?.user?.credits, setCredits]);

  return { credits };
}
