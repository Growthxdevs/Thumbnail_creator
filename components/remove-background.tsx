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

// Text element type
export type TextElement = {
  id: string;
  text: string;
  textSize: number;
  textColor: string;
  horizontalPosition: number;
  verticalPosition: number;
  rotation: number;
  textOpacity: number;
  fontFamily: string;
  outlineWidth: number;
  outlineEnabled: boolean;
  outlineColor: string;
  outlineTransparency: number;
  lineHeight: number;
  textAlign: "left" | "center" | "right";
  textShadow: number;
  textAboveImage: boolean;
};

// interface RemoveBackgroundProps {
//   imageUrl: string;
// }

export default function RemoveBackground() {
  const { data: session } = useSession();
  const { credits, deductCredits } = useCreditStore();
  useCreditInit(); // Initialize credits from session

  // Multiple text elements support
  const [textElements, setTextElements] = useState<TextElement[]>([
    {
      id: "1",
      text: "Text",
      textSize: 200,
      textColor: "#ffffff",
      horizontalPosition: 50,
      verticalPosition: 50,
      rotation: 0,
      textOpacity: 1,
      fontFamily: "Arial",
      outlineWidth: 2,
      outlineEnabled: false,
      outlineColor: "#ffffff",
      outlineTransparency: 1,
      lineHeight: 1.2,
      textAlign: "center",
      textShadow: 0,
      textAboveImage: false,
    },
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string>("1");

  // Legacy state for backward compatibility (will be removed)
  const [text, setText] = useState("Text");
  const [textSize, setTextSize] = useState(200);
  const [textColor, setTextColor] = useState("#ffffff");
  const [horizontalPosition, setHorizontalPosition] = useState(50);
  const [verticalPosition, setVerticalPosition] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [textOpacity, setTextOpacity] = useState(1);
  const [fontFamily, setFontFamily] = useState("Arial");
  // Legacy state variables kept for backward compatibility with ImageControls
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [outlineWidth, setOutlineWidth] = useState(2);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [outlineEnabled, setOutlineEnabled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [outlineColor, setOutlineColor] = useState(textColor);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [outlineTransparency, setOutlineTransparency] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lineHeight, setLineHeight] = useState(1.2);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "center"
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [textShadow, setTextShadow] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Get selected text element
  const selectedText =
    textElements.find((el) => el.id === selectedTextId) || textElements[0];

  // Helper functions for managing text elements
  const addTextElement = () => {
    const newId = Date.now().toString();
    const newElement: TextElement = {
      id: newId,
      text: "Text",
      textSize: 200,
      textColor: "#ffffff",
      horizontalPosition: 50,
      verticalPosition: 50,
      rotation: 0,
      textOpacity: 1,
      fontFamily: "Arial",
      outlineWidth: 2,
      outlineEnabled: false,
      outlineColor: "#ffffff",
      outlineTransparency: 1,
      lineHeight: 1.2,
      textAlign: "center",
      textShadow: 0,
      textAboveImage: false,
    };
    setTextElements([...textElements, newElement]);
    setSelectedTextId(newId);
  };

  const removeTextElement = (id: string) => {
    if (textElements.length <= 1) {
      // Don't allow removing the last text element
      return;
    }
    const newElements = textElements.filter((el) => el.id !== id);
    setTextElements(newElements);
    // Select the first element if the removed one was selected
    if (selectedTextId === id) {
      setSelectedTextId(newElements[0].id);
    }
  };

  const copyTextElement = (id: string) => {
    const elementToCopy = textElements.find((el) => el.id === id);
    if (!elementToCopy) return;

    const newId = Date.now().toString();
    const newElement: TextElement = {
      ...elementToCopy,
      id: newId,
      // Slightly offset the copied text so it's visible
      horizontalPosition: Math.min(100, elementToCopy.horizontalPosition + 5),
      verticalPosition: Math.min(100, elementToCopy.verticalPosition + 5),
    };
    setTextElements([...textElements, newElement]);
    setSelectedTextId(newId);
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(
      textElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  // Legacy textPositionStyle for backward compatibility
  const textPositionStyle = {
    left: `${selectedText.horizontalPosition}%`,
    top: `${selectedText.verticalPosition}%`,
    transform: `translate(-50%, -50%) rotate(${selectedText.rotation}deg)`,
    opacity: selectedText.textOpacity,
    fontFamily: selectedText.fontFamily,
  };

  // Get user pro status from session
  const isPro = session?.user?.isPro ?? false;

  // Update canSave state based on content availability
  useEffect(() => {
    const hasContent = removedBgImage && resultImage;
    setCanSave(!!hasContent);
  }, [removedBgImage, resultImage, setCanSave]);

  // Sync legacy state with selected text element for backward compatibility
  useEffect(() => {
    if (selectedText) {
      setText(selectedText.text);
      setTextSize(selectedText.textSize);
      setTextColor(selectedText.textColor);
      setHorizontalPosition(selectedText.horizontalPosition);
      setVerticalPosition(selectedText.verticalPosition);
      setRotation(selectedText.rotation);
      setTextOpacity(selectedText.textOpacity);
      setFontFamily(selectedText.fontFamily);
      setOutlineWidth(selectedText.outlineWidth);
      setOutlineEnabled(selectedText.outlineEnabled);
      setOutlineColor(selectedText.outlineColor);
      setOutlineTransparency(selectedText.outlineTransparency);
      setLineHeight(selectedText.lineHeight);
      setTextAlign(selectedText.textAlign);
      setTextShadow(selectedText.textShadow);
      setTextAboveImage(selectedText.textAboveImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedText?.id,
    selectedText?.text,
    selectedText?.textSize,
    selectedText?.textColor,
    selectedText?.horizontalPosition,
    selectedText?.verticalPosition,
    selectedText?.rotation,
    selectedText?.textOpacity,
    selectedText?.fontFamily,
    selectedText?.outlineWidth,
    selectedText?.outlineEnabled,
    selectedText?.outlineColor,
    selectedText?.outlineTransparency,
    selectedText?.lineHeight,
    selectedText?.textAlign,
    selectedText?.textShadow,
    selectedText?.textAboveImage,
  ]);

  // Sync outline color with text color when text color changes
  useEffect(() => {
    if (selectedText && selectedText.outlineColor !== selectedText.textColor) {
      updateTextElement(selectedText.id, {
        outlineColor: selectedText.textColor,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedText?.textColor, selectedText?.id]);

  // Ensure text size is never below minimum
  useEffect(() => {
    if (selectedText && selectedText.textSize < 8) {
      updateTextElement(selectedText.id, { textSize: 8 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedText?.textSize, selectedText?.id]);

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
                  text={selectedText.text}
                  textSize={selectedText.textSize}
                  textColor={selectedText.textColor}
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
                  outlineWidth={selectedText.outlineWidth}
                  outlineEnabled={selectedText.outlineEnabled}
                  outlineColor={selectedText.outlineColor}
                  outlineTransparency={selectedText.outlineTransparency}
                  setHorizontalPosition={setHorizontalPosition}
                  setVerticalPosition={setVerticalPosition}
                  horizontalPosition={selectedText.horizontalPosition}
                  verticalPosition={selectedText.verticalPosition}
                  lineHeight={selectedText.lineHeight}
                  textAlign={selectedText.textAlign}
                  textShadow={selectedText.textShadow}
                  textAboveImage={selectedText.textAboveImage}
                  textElements={textElements}
                  selectedTextId={selectedTextId}
                  onTextElementUpdate={updateTextElement}
                  onTextElementSelect={setSelectedTextId}
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
                    text={selectedText.text}
                    setResultImage={setResultImage}
                    setText={setText}
                    textSize={selectedText.textSize}
                    setTextSize={setTextSize}
                    textColor={selectedText.textColor}
                    setTextColor={setTextColor}
                    textOpacity={selectedText.textOpacity}
                    setTextOpacity={setTextOpacity}
                    horizontalPosition={selectedText.horizontalPosition}
                    setHorizontalPosition={setHorizontalPosition}
                    verticalPosition={selectedText.verticalPosition}
                    setVerticalPosition={setVerticalPosition}
                    fontFamily={selectedText.fontFamily}
                    setFontFamily={setFontFamily}
                    rotation={selectedText.rotation}
                    removeBgImage={removedBgImage}
                    setRemovedBgImage={setRemovedBgImage}
                    setRotation={setRotation}
                    setIsCleared={setIsCleared}
                    setIsGenerated={setIsGenerated}
                    setOriginalFile={setOriginalFile}
                    setResetFileInput={setResetFileInput}
                    isPro={isPro}
                    outlineWidth={selectedText.outlineWidth}
                    setOutlineWidth={setOutlineWidth}
                    outlineEnabled={selectedText.outlineEnabled}
                    setOutlineEnabled={setOutlineEnabled}
                    outlineColor={selectedText.outlineColor}
                    setOutlineColor={setOutlineColor}
                    outlineTransparency={selectedText.outlineTransparency}
                    setOutlineTransparency={setOutlineTransparency}
                    lineHeight={selectedText.lineHeight}
                    setLineHeight={setLineHeight}
                    textAlign={selectedText.textAlign}
                    setTextAlign={setTextAlign}
                    textShadow={selectedText.textShadow}
                    setTextShadow={setTextShadow}
                    textAboveImage={selectedText.textAboveImage}
                    setTextAboveImage={setTextAboveImage}
                    fastGenStatus={fastGenStatus}
                    textElements={textElements}
                    selectedTextId={selectedTextId}
                    onTextElementUpdate={updateTextElement}
                    onTextElementSelect={setSelectedTextId}
                    onAddTextElement={addTextElement}
                    onRemoveTextElement={removeTextElement}
                    onCopyTextElement={copyTextElement}
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
