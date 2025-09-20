"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface CreditContextType {
  credits: number;
  setCredits: (credits: number) => void;
  deductCredits: (amount: number) => void;
  refreshCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [credits, setCredits] = useState(session?.user?.credits ?? 0);

  // Update credits when session changes
  useEffect(() => {
    if (session?.user?.credits !== undefined) {
      setCredits(session.user.credits);
    }
  }, [session?.user?.credits]);

  const deductCredits = (amount: number) => {
    setCredits((prev) => Math.max(0, prev - amount));
  };

  const refreshCredits = async () => {
    try {
      const response = await fetch("/api/credits/deduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 0 }), // Just get current credits
      });

      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error("Error refreshing credits:", error);
    }
  };

  return (
    <CreditContext.Provider
      value={{ credits, setCredits, deductCredits, refreshCredits }}
    >
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditProvider");
  }
  return context;
}
