"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCreditStore } from "@/stores/credit-store";
import { useCreditInit } from "@/hooks/use-credit-init";
import ImagePreview from "./image-preview";
import ImageControls from "./image-controls";
import SaveProjectDialog from "./save-project-dialog";
// import { Project } from "@/types/project";
import { useSaveProject } from "@/contexts/save-project-context";

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
  const [outlineWidth, setOutlineWidth] = useState(2);
  const [outlineEnabled, setOutlineEnabled] = useState(false);
  const [outlineColor, setOutlineColor] = useState(textColor);
  const [outlineTransparency, setOutlineTransparency] = useState(1);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "center"
  );
  const [textShadow, setTextShadow] = useState(0);
  const [textAboveImage, setTextAboveImage] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [removedBgImage, setRemovedBgImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [resetFileInput, setResetFileInput] = useState(0);
  const { setCanSave } = useSaveProject();

  // Fast generation is now automatically determined by server
  const [fastGenStatus, setFastGenStatus] = useState<{
    isPro: boolean;
    canUse: boolean;
    remainingFastGenerations: number;
    weeklyLimit: number;
    usedThisWeek: number;
    weekStart: string;
  } | null>(null);

  const textPositionStyle = {
    left: `${horizontalPosition}%`,
    top: `${verticalPosition}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    opacity: textOpacity,
    fontFamily: fontFamily,
  };

  // Get user pro status from session
  const isPro = session?.user?.isPro ?? false;

  // Update canSave state based on content availability
  useEffect(() => {
    const hasContent = removedBgImage && resultImage;
    setCanSave(!!hasContent);
  }, [removedBgImage, resultImage, setCanSave]);

  // Sync outline color with text color when text color changes
  useEffect(() => {
    setOutlineColor(textColor);
  }, [textColor]);

  // Ensure text size is never below minimum
  useEffect(() => {
    if (textSize < 8) {
      setTextSize(8);
    }
  }, [textSize, setTextSize]);

  // Fetch fast generation status on component mount
  useEffect(() => {
    const fetchFastGenStatus = async () => {
      try {
        const response = await fetch("/api/fast-generation-status");
        if (response.ok) {
          const status = await response.json();
          setFastGenStatus(status);
          // Fast generation is now automatically determined by server
        }
      } catch (error) {
        console.error("Error fetching fast generation status:", error);
      }
    };

    if (session?.user?.id) {
      fetchFastGenStatus();
    }
  }, [session?.user?.id]);

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

  // Function to handle remove/clear image
  const handleRemove = () => {
    setRemovedBgImage("");
    setResultImage(null);
    setIsCleared(true);
    setIsGenerated(false);
    setOriginalFile(null);
    setResetFileInput((prev) => prev + 1);
  };

  // Function to handle generate action
  const handleGenerate = async () => {
    if (credits <= 0) {
      const notification = document.createElement("div");
      notification.textContent =
        "You don't have enough credits to generate. Please purchase more credits.";
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 5000);
      return;
    }

    if (!originalFile) {
      const notification = document.createElement("div");
      notification.textContent = "No image file available for processing.";
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 5000);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", originalFile);
      // Fast generation is automatically determined by server based on user status and availability

      const response = await fetch("/api/removeBg", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResultImage(data.image);
        setIsGenerated(true);

        // Update credits from server response (credits are deducted on server side)
        if (data.credits !== undefined) {
          // Update the credit store with the new credit count from server
          const { useCreditStore } = await import("@/stores/credit-store");
          const { setCredits } = useCreditStore.getState();
          setCredits(data.credits);
        }

        // Update fast generation status if provided
        if (data.remainingFastGenerations !== undefined) {
          setFastGenStatus((prev) =>
            prev
              ? {
                  ...prev,
                  remainingFastGenerations: data.remainingFastGenerations,
                  canUse: data.remainingFastGenerations > 0,
                }
              : null
          );
        }

        const notification = document.createElement("div");
        let notificationText =
          "Image generated successfully! You can now download for free.";

        if (data.fastGenerationUsed && !data.isPro) {
          notificationText += ` Fast generation used! ${data.remainingFastGenerations} remaining this week.`;
        } else if (!data.fastGenerationUsed && !data.isPro) {
          notificationText +=
            " Using standard generation. Upgrade to Pro for faster processing!";
        }

        notification.textContent = notificationText;
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 5000);
      } else {
        const errorData = await response.json();
        if (
          response.status === 429 &&
          errorData.message.includes("Fast generation limit")
        ) {
          const notification = document.createElement("div");
          notification.textContent = `Fast generation limit reached! ${errorData.remainingFastGenerations} remaining this week. Upgrade to Pro for unlimited fast generation.`;
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f59e0b;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          `;
          document.body.appendChild(notification);
          setTimeout(() => document.body.removeChild(notification), 5000);

          // Update fast generation status
          setFastGenStatus((prev) =>
            prev
              ? {
                  ...prev,
                  remainingFastGenerations: errorData.remainingFastGenerations,
                  canUse: false,
                }
              : null
          );
        } else {
          throw new Error("Failed to process image");
        }
      }
    } catch (error) {
      console.error("Error processing image:", error);
      const notification = document.createElement("div");
      notification.textContent = "Failed to process image. Please try again.";
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Function to save project
  const handleSaveProject = async (name: string, description: string) => {
    setSaving(true);
    try {
      const projectData = {
        text,
        textSize,
        textColor,
        horizontalPosition,
        verticalPosition,
        rotation,
        textOpacity,
        fontFamily,
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          projectData,
          originalImage: removedBgImage,
          processedImage: resultImage,
          finalImage: resultImage, // For now, using resultImage as final
        }),
      });

      if (response.ok) {
        const project = await response.json();
        console.log("Project saved successfully:", project);

        // Show success notification
        const notification = document.createElement("div");
        notification.textContent = "Project saved successfully!";
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
      } else {
        throw new Error("Failed to save project");
      }
    } catch (error) {
      console.error("Error saving project:", error);

      // Show error notification
      const notification = document.createElement("div");
      notification.textContent = "Failed to save project. Please try again.";
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Function to load project
  // const handleLoadProject = (project: Project) => {
  //   try {
  //     const projectData = project.projectData;

  //     // Restore all editing parameters
  //     setText(projectData.text || "Text");
  //     setTextSize(projectData.textSize || 200);
  //     setTextColor(projectData.textColor || "#ffffff");
  //     setHorizontalPosition(projectData.horizontalPosition || 50);
  //     setVerticalPosition(projectData.verticalPosition || 50);
  //     setRotation(projectData.rotation || 0);
  //     setTextOpacity(projectData.textOpacity || 1);
  //     setFontFamily(projectData.fontFamily || "Arial");

  //     // Restore images
  //     if (project.originalImage) {
  //       setRemovedBgImage(project.originalImage);
  //     }
  //     if (project.processedImage) {
  //       setResultImage(project.processedImage);
  //     }

  //     setIsCleared(false);

  //     // Show success notification
  //     const notification = document.createElement("div");
  //     notification.textContent = `Project "${project.name}" loaded successfully!`;
  //     notification.style.cssText = `
  //       position: fixed;
  //       top: 20px;
  //       right: 20px;
  //       background: #10b981;
  //       color: white;
  //       padding: 12px 16px;
  //       border-radius: 8px;
  //       z-index: 1000;
  //       box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  //     `;
  //     document.body.appendChild(notification);
  //     setTimeout(() => document.body.removeChild(notification), 3000);
  //   } catch (error) {
  //     console.error("Error loading project:", error);

  //     // Show error notification
  //     const notification = document.createElement("div");
  //     notification.textContent = "Failed to load project. Please try again.";
  //     notification.style.cssText = `
  //       position: fixed;
  //       top: 20px;
  //       right: 20px;
  //       background: #ef4444;
  //       color: white;
  //       padding: 12px 16px;
  //       border-radius: 8px;
  //       z-index: 1000;
  //       box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  //     `;
  //     document.body.appendChild(notification);
  //     setTimeout(() => document.body.removeChild(notification), 5000);
  //   }
  // };

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      <div className="relative max-w-7xl mx-auto">
        {/* Save Project Dialog (hidden, only accessible via nav button) */}
        <SaveProjectDialog
          onSave={handleSaveProject}
          disabled={!removedBgImage || !resultImage}
          isLoading={saving}
        />

        {/* Main Content */}
        <div className="w-full">
          {/* Header Section */}
          {/* <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold dark-glow-text mb-4">
              Text with Image
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Create stunning images with AI-powered background removal and customizable text overlays
            </p>
          </div> */}

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Image Preview Section */}
            <div
              className={`lg:col-span-7 ${
                !resultImage ? "lg:col-start-3" : ""
              }`}
            >
              <div className="sticky top-6">
                <ImagePreview
                  loading={loading}
                  textPositionStyle={textPositionStyle}
                  resultImage={resultImage}
                  text={text}
                  textSize={textSize}
                  textColor={textColor}
                  removedBgImage={removedBgImage}
                  setRemovedBgImage={setRemovedBgImage}
                  isCleared={isCleared}
                  setIsCleared={setIsCleared}
                  credits={credits}
                  onCreditDeduction={handleCreditDeduction}
                  isGenerated={isGenerated}
                  onGenerate={handleGenerate}
                  onRemove={handleRemove}
                  setOriginalFile={setOriginalFile}
                  resetFileInput={resetFileInput}
                  outlineWidth={outlineWidth}
                  outlineEnabled={outlineEnabled}
                  outlineColor={outlineColor}
                  outlineTransparency={outlineTransparency}
                  setHorizontalPosition={setHorizontalPosition}
                  setVerticalPosition={setVerticalPosition}
                  horizontalPosition={horizontalPosition}
                  verticalPosition={verticalPosition}
                  lineHeight={lineHeight}
                  textAlign={textAlign}
                  textShadow={textShadow}
                  textAboveImage={textAboveImage}
                />
              </div>
            </div>

            {/* Controls Section - Only show when image has been created */}
            {resultImage && (
              <div className="lg:col-span-5">
                <div className="sticky top-6">
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
                    setIsGenerated={setIsGenerated}
                    setOriginalFile={setOriginalFile}
                    setResetFileInput={setResetFileInput}
                    isPro={isPro}
                    outlineWidth={outlineWidth}
                    setOutlineWidth={setOutlineWidth}
                    outlineEnabled={outlineEnabled}
                    setOutlineEnabled={setOutlineEnabled}
                    outlineColor={outlineColor}
                    setOutlineColor={setOutlineColor}
                    outlineTransparency={outlineTransparency}
                    setOutlineTransparency={setOutlineTransparency}
                    lineHeight={lineHeight}
                    setLineHeight={setLineHeight}
                    textAlign={textAlign}
                    setTextAlign={setTextAlign}
                    textShadow={textShadow}
                    setTextShadow={setTextShadow}
                    textAboveImage={textAboveImage}
                    setTextAboveImage={setTextAboveImage}
                    fastGenStatus={fastGenStatus}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
