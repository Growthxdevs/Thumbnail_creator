import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CreditState {
  credits: number;
  setCredits: (credits: number) => void;
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  resetCredits: () => void;
}

export const useCreditStore = create<CreditState>()(
  persist(
    (set) => ({
      credits: 0,

      setCredits: (credits: number) => set({ credits }),

      deductCredits: (amount: number) =>
        set((state) => {
          // Additional safety check: only deduct if we have enough credits
          if (state.credits < amount) {
            console.warn("Attempted to deduct more credits than available");
            return state; // Return current state without changes
          }
          return {
            credits: Math.max(0, state.credits - amount),
          };
        }),

      addCredits: (amount: number) =>
        set((state) => ({
          credits: state.credits + amount,
        })),

      resetCredits: () => set({ credits: 0 }),
    }),
    {
      name: "credit-storage", // unique name for localStorage key
      // Only persist credits, not the functions
      partialize: (state) => ({ credits: state.credits }),
    }
  )
);
