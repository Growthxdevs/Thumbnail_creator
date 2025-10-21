import React, { useRef, useState } from "react";
import Image from "next/image";
import { Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import domtoimage from "dom-to-image";

type ImagePreviewProps = {
  loading: boolean;
  textPositionStyle: React.CSSProperties;
  text: string;
  textSize: number;
  textColor: string;
  resultImage: string | null;
  removedBgImage: string;
  setRemovedBgImage: (value: string) => void;
  isCleared: boolean;
  setIsCleared: (value: boolean) => void;
  credits: number;
  onCreditDeduction: () => Promise<boolean>;
  isGenerated: boolean;
  onGenerate: () => void;
  setOriginalFile: (file: File | null) => void;
  resetFileInput: number;
  outlineWidth: number;
  outlineEnabled: boolean;
  outlineColor: string;
  outlineTransparency: number;
  setHorizontalPosition: (value: number) => void;
  setVerticalPosition: (value: number) => void;
  horizontalPosition: number;
  verticalPosition: number;
  lineHeight: number;
};

function ImagePreview({
  loading,
  textPositionStyle,
  text,
  textSize,
  textColor,
  resultImage,
  removedBgImage,
  setRemovedBgImage,
  isCleared,
  setIsCleared,
  credits,
  onCreditDeduction,
  isGenerated,
  onGenerate,
  setOriginalFile,
  resetFileInput,
  outlineWidth,
  outlineEnabled,
  outlineColor,
  outlineTransparency,
  setHorizontalPosition,
  setVerticalPosition,
  horizontalPosition,
  verticalPosition,
  lineHeight,
}: ImagePreviewProps) {
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const compositionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to reset file input
  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Function to handle mouse down for starting drag
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only allow dragging if there's an image and text to position
    if (!removedBgImage || isCleared || !text) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate current text position in pixels
    const currentTextX = (horizontalPosition / 100) * rect.width;
    const currentTextY = (verticalPosition / 100) * rect.height;

    // Calculate offset from mouse to text center
    const offsetX = mouseX - currentTextX;
    const offsetY = mouseY - currentTextY;

    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);

    // Prevent text selection during drag
    e.preventDefault();
  };

  // Function to handle mouse move during drag
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !removedBgImage || isCleared || !text) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Apply offset to get the actual text position
    const textX = mouseX - dragOffset.x;
    const textY = mouseY - dragOffset.y;

    // Convert to percentages (0-100)
    const horizontalPercent = (textX / rect.width) * 100;
    const verticalPercent = (textY / rect.height) * 100;

    // Clamp values between 0 and 100
    const clampedHorizontal = Math.max(0, Math.min(100, horizontalPercent));
    const clampedVertical = Math.max(0, Math.min(100, verticalPercent));

    setHorizontalPosition(clampedHorizontal);
    setVerticalPosition(clampedVertical);
  };

  // Function to handle mouse up to end drag
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Function to handle mouse leave to end drag
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Call resetInput when resetFileInput prop changes
  React.useEffect(() => {
    resetInput();
  }, [resetFileInput]);
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only check credits and deduct if image hasn't been generated yet
    if (!isGenerated) {
      // Check if user has credits
      if (credits <= 0) {
        // Use a more modern notification instead of alert
        const notification = document.createElement("div");
        notification.textContent =
          "You don't have enough credits to download. Please purchase more credits.";
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

      // Deduct credit before download
      const creditDeducted = await onCreditDeduction();
      if (!creditDeducted) {
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
        return;
      }
    }

    try {
      if (compositionRef.current) {
        const scale = 4;

        const blob = await domtoimage.toBlob(compositionRef.current, {
          width: compositionRef.current.clientWidth * scale,
          height: compositionRef.current.clientHeight * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${compositionRef.current.clientWidth * scale}px`,
            height: `${compositionRef.current.clientHeight * scale}px`,
          },
        });

        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = "edited-image.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      const notification = document.createElement("div");
      notification.textContent =
        "An error occurred while generating the image. Please try again.";
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

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const img = e.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    const maxWidth = 650;
    const maxHeight = 565;

    let newWidth = img.naturalWidth;
    let newHeight = img.naturalHeight;

    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    setImageWidth(newWidth);
    setImageHeight(newHeight);
  };
  return (
    <div className="w-full md:w-3/5 backdrop-blur-md dark-card-bg rounded-lg shadow-2xl p-4 flex flex-col gap-4 items-center">
      <div
        ref={compositionRef}
        className={`relative flex min-h-[400px] items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden w-full select-none ${
          removedBgImage && !isCleared && text
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-default"
        }`}
        style={{
          width: imageWidth ? `${imageWidth}px` : "100%",
          height: imageHeight ? `${imageHeight}px` : "400px",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        title={
          removedBgImage && !isCleared && text
            ? "Click and drag to position text"
            : ""
        }
      >
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}

        {removedBgImage && !isCleared && (
          <Image
            src={removedBgImage}
            alt="Subject"
            fill
            onLoad={handleImageLoad}
            className="object-contain"
            unoptimized
            priority
          />
        )}

        {/* Outline text above removeBgImage */}
        {removedBgImage && !isCleared && outlineEnabled && (
          <div
            className={`absolute flex items-center justify-center w-full transition-all duration-150 ${
              isDragging ? "scale-105 drop-shadow-lg" : ""
            }`}
            style={{
              ...textPositionStyle,
              zIndex: 30,
            }}
          >
            <h1
              className="font-bold whitespace-pre-line"
              style={{
                fontSize: `${textSize}px`,
                color: "rgba(0,0,0,0)",
                WebkitTextStroke: `${outlineWidth}px ${outlineColor}`,
                textShadow: "none",
                opacity: outlineTransparency,
                lineHeight: lineHeight,
              }}
            >
              {text}
            </h1>
          </div>
        )}

        {resultImage && !isCleared && (
          <div
            className={`absolute flex items-center justify-center z-10 w-full transition-all duration-150 ${
              isDragging ? "scale-105 drop-shadow-lg" : ""
            }`}
            style={textPositionStyle}
          >
            <h1
              className="font-bold whitespace-pre-line"
              style={{
                fontSize: `${textSize}px`,
                color: textColor,
                lineHeight: lineHeight,
              }}
            >
              {text}
            </h1>
          </div>
        )}

        {resultImage && !isCleared && (
          <Image
            src={resultImage}
            alt="Processed Image"
            fill
            className="object-contain z-20"
            unoptimized
          />
        )}

        {!removedBgImage && (
          <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-500/30">
            <div className="text-center p-6">
              <p className="text-gray-300">
                Upload your transparent background image (PNG)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const imageUrl = URL.createObjectURL(file);
                    setRemovedBgImage(imageUrl);
                    // Store the file for later processing
                    setOriginalFile(file);
                    // Reset cleared state so the new image can be displayed
                    setIsCleared(false);
                  }
                  // Reset the input value to allow re-uploading the same file
                  e.target.value = "";
                }}
                className="mt-4 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        {!isGenerated ? (
          // Generate Button
          <Button
            type="button"
            onClick={onGenerate}
            disabled={credits <= 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {credits <= 0
              ? "No Credits Available"
              : "Generate Image (1 Credit)"}
          </Button>
        ) : (
          // Download Button
          <Button
            type="button"
            onClick={(e) => handleDownload(e)}
            disabled={!resultImage}
            variant="outline"
            className="flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download Image
          </Button>
        )}
        {!isGenerated && credits <= 0 && removedBgImage && (
          <p className="text-red-400 text-sm text-center">
            You need at least 1 credit to generate. Click &quot;Purchase
            Credits&quot; to buy more.
          </p>
        )}
      </div>
    </div>
  );
}

export default ImagePreview;
