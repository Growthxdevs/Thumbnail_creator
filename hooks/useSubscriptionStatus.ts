import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export function useSubscriptionStatus() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only make the request if we have a session
    if (status === "loading") {
      return; // Still loading session
    }

    if (status === "unauthenticated") {
      setLoading(false);
      setError(null);
      return; // No session, user not authenticated
    }

    if (session) {
      setError(null);
      axios
        .get("/api/user-subscription", {
          withCredentials: true, // Include cookies for authentication
          timeout: 10000, // 10 second timeout
        })
        .then((res) => {
          setIsPro(res.data.isPro || false);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to fetch subscription status:", err);
          const errorMessage =
            err.response?.data?.error ||
            err.message ||
            "Failed to fetch subscription status";
          setError(errorMessage);
          setIsPro(false); // Default to false on error

          // Log additional details for debugging
          if (err.response?.status === 401) {
            console.warn(
              "Authentication failed - user may need to sign in again"
            );
          }
        })
        .finally(() => setLoading(false));
    }
  }, [session, status]);

  return { isPro, loading, error };
}
