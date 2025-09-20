"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useCreditStore } from "@/stores/credit-store";
import { useCreditInit } from "@/hooks/use-credit-init";
import ImagePreview from "./image-preview";
import ImageControls from "./image-controls";

// interface RemoveBackgroundProps {
//   imageUrl: string;
// }

export default function RemoveBackground() {
  const { data: session } = useSession();
  const { credits, deductCredits } = useCreditStore();
  useCreditInit(); // Initialize credits from session
  const [text, setText] = useState("Text");
  const [textSize, setTextSize] = useState(200);
  const [textColor, setTextColor] = useState("#ffffff");
  const [horizontalPosition, setHorizontalPosition] = useState(50);
  const [verticalPosition, setVerticalPosition] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [textOpacity, setTextOpacity] = useState(1);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [removedBgImage, setRemovedBgImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  const textPositionStyle = {
    left: `${horizontalPosition}%`,
    top: `${verticalPosition}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    opacity: textOpacity,
    fontFamily: fontFamily,
  };

  // Get user pro status from session
  const isPro = session?.user?.isPro ?? false;

  // Function to handle credit deduction
  const handleCreditDeduction = async () => {
    // Double-check credits before making API call
    if (credits <= 0) {
      console.log("Client-side validation: No credits available");
      return false; // No credits available
    }

    try {
      const response = await fetch("/api/credits/deduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 1 }),
      });

      if (response.ok) {
        const data = await response.json();
        // Only update Zustand store if API call was successful
        deductCredits(1);
        console.log("Credit deducted successfully, new balance:", data.credits);
        return true; // Credit deducted successfully
      } else {
        const errorData = await response.json();
        console.error("API validation failed:", errorData);
        return false;
      }
    } catch (error) {
      console.error("Error deducting credit:", error);
      return false;
    }
  };

  return (
    <div className="w-full min-h-screen p-8">
      <div className="relative max-w-6xl mx-auto">
        {/* Credits Card - Fixed Position */}
        {/* <div className="fixed top-20 right-8 p-6 border rounded-lg bg-white shadow-lg transition-all hover:shadow-xl">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-yellow-500" />
            <div>
              <h2 className="text-sm font-semibold text-gray-600">
                Available Credits
              </h2>
              <p className="text-2xl font-bold text-gray-800">
                {session?.user?.credits ?? 0}
              </p>
            </div>
          </div>
        </div> */}

        {/* Main Content */}
        <div className="max-w-6xl w-full flex gap-6 sm:flex-wrap md:flex-nowrap">
          {/* Left Side - Image Preview */}
          <ImagePreview
            loading={loading}
            setLoading={setLoading}
            textPositionStyle={textPositionStyle}
            resultImage={resultImage}
            setResultImage={setResultImage}
            text={text}
            textSize={textSize}
            textColor={textColor}
            removedBgImage={removedBgImage}
            setRemovedBgImage={setRemovedBgImage}
            isCleared={isCleared}
            setIsCleared={setIsCleared}
            credits={credits}
            onCreditDeduction={handleCreditDeduction}
          />

          {/* Right Side - Controls */}
          <ImageControls
            setLoading={setLoading}
            credits={credits}
            text={text}
            setResultImage={setResultImage}
            setText={setText}
            textSize={textSize}
            setTextSize={setTextSize}
            textColor={textColor}
            setTextColor={setTextColor}
            textOpacity={textOpacity}
            setTextOpacity={setTextOpacity}
            horizontalPosition={horizontalPosition}
            setHorizontalPosition={setHorizontalPosition}
            verticalPosition={verticalPosition}
            setVerticalPosition={setVerticalPosition}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            rotation={rotation}
            removeBgImage={removedBgImage}
            setRemovedBgImage={setRemovedBgImage}
            setRotation={setRotation}
            setIsCleared={setIsCleared}
            isPro={isPro}
          />
        </div>
      </div>
    </div>
  );
}
