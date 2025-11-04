"use client";

import { useState, useEffect } from "react";

export type Currency = "INR" | "USD";

interface CurrencyInfo {
  currency: Currency;
  symbol: string;
  isIndia: boolean;
  isLoading: boolean;
}

export function useCurrency(): CurrencyInfo {
  // Start with loading state and default to USD
  // We'll fetch IP geolocation to determine actual location
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo>({
    currency: "USD",
    symbol: "$",
    isIndia: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check user location using IP geolocation
    const detectLocation = async () => {
      try {
        // Use IP-based geolocation (respects VPN)
        const geoResponse = await fetch("https://ipapi.co/json/");
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.country_code === "IN") {
            setCurrencyInfo({
              currency: "INR",
              symbol: "₹",
              isIndia: true,
              isLoading: false,
            });
            return;
          } else {
            // If IP says not India, use USD
            setCurrencyInfo({
              currency: "USD",
              symbol: "$",
              isIndia: false,
              isLoading: false,
            });
            return;
          }
        }
      } catch {
        console.log("Geo-location fetch failed, defaulting to USD");
        // If IP geolocation fails, default to USD
        setCurrencyInfo({
          currency: "USD",
          symbol: "$",
          isIndia: false,
          isLoading: false,
        });
        return;
      }
    };

    detectLocation();
  }, []);

  return currencyInfo;
}
