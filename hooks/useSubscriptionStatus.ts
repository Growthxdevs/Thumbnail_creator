import { useState, useEffect } from "react";
import axios from "axios";

export function useSubscriptionStatus() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/user-subscription")
      .then((res) => setIsPro(res.data.isPro))
      .catch((err) =>
        console.error("Failed to fetch subscription status:", err)
      )
      .finally(() => setLoading(false));
  }, []);

  return { isPro, loading };
}
