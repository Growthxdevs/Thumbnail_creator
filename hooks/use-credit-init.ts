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

  useEffect(() => {
    // Listen for credits update events
    const handleCreditsUpdate = async () => {
      try {
        const response = await fetch("/api/user-subscription");
        if (response.ok) {
          const data = await response.json();
          if (data.credits !== undefined) {
            setCredits(data.credits);
          }
        }
      } catch (error) {
        console.error("Error refreshing credits:", error);
      }
    };

    window.addEventListener("creditsUpdated", handleCreditsUpdate);

    return () => {
      window.removeEventListener("creditsUpdated", handleCreditsUpdate);
    };
  }, [setCredits]);

  return { credits };
}
