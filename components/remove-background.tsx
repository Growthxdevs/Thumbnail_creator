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

    const creditDeducted = await handleCreditDeduction();
    if (creditDeducted) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("image", originalFile);

        const response = await fetch("/api/removeBg", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setResultImage(data.image);
          setIsGenerated(true);
          const notification = document.createElement("div");
          notification.textContent =
            "Image generated successfully! You can now download for free.";
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
          throw new Error("Failed to process image");
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
    } else {
      const notification = document.createElement("div");
      notification.textContent = "Failed to deduct credit. Please try again.";
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

        {/* Save Project Dialog (hidden, only accessible via nav button) */}
        <SaveProjectDialog
          onSave={handleSaveProject}
          disabled={!removedBgImage || !resultImage}
          isLoading={saving}
        />

        {/* Main Content */}
        <div className="max-w-6xl w-full flex gap-6 sm:flex-wrap md:flex-nowrap">
          {/* Left Side - Image Preview */}
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
          />
        </div>
      </div>
    </div>
  );
}
