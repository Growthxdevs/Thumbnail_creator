import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Download, Loader2, X } from "lucide-react";
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
  onRemove?: () => void;
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
  textAlign: "left" | "center" | "right";
  textShadow: number;
  textAboveImage: boolean;
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
  onRemove,
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
  textAlign,
  textShadow,
  textAboveImage,
}: ImagePreviewProps) {
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const compositionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when downloading
  useEffect(() => {
    if (downloading) {
      // Prevent scrolling
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [downloading]);

  // Function to reset file input
  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Function to handle mouse down for starting drag
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only allow dragging if there's a result image and text to position
    if (!resultImage || isCleared || !text) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate current text position in pixels
    const currentTextX = (horizontalPosition / 100) * rect.width;
    const currentTextY = (verticalPosition / 100) * rect.height;

    // Calculate offset from mouse to text center
    const offsetX = mouseX - currentTextX;
    const offsetY = mouseY - currentTextY;

    dragOffsetRef.current = { x: offsetX, y: offsetY };
    setIsDragging(true);

    // Prevent text selection during drag
    e.preventDefault();
  };

  // Handle document-level mouse move for smooth dragging
  useEffect(() => {
    if (!isDragging || !resultImage || isCleared || !text) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!compositionRef.current) return;

      const rect = compositionRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Apply offset to get the actual text position
      const textX = mouseX - dragOffsetRef.current.x;
      const textY = mouseY - dragOffsetRef.current.y;

      // Convert to percentages (0-100)
      const horizontalPercent = (textX / rect.width) * 100;
      const verticalPercent = (textY / rect.height) * 100;

      // Clamp values between 0 and 100
      const clampedHorizontal = Math.max(0, Math.min(100, horizontalPercent));
      const clampedVertical = Math.max(0, Math.min(100, verticalPercent));

      setHorizontalPosition(clampedHorizontal);
      setVerticalPosition(clampedVertical);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Add document-level event listeners for smooth dragging
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    resultImage,
    isCleared,
    text,
    setHorizontalPosition,
    setVerticalPosition,
  ]);

  // Function to handle mouse up to end drag (fallback)
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Function to handle mouse leave to end drag (fallback)
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Call resetInput when resetFileInput prop changes
  React.useEffect(() => {
    resetInput();
  }, [resetFileInput]);

  // Reset image dimensions when image is cleared
  React.useEffect(() => {
    if (isCleared || !removedBgImage) {
      setImageWidth(0);
      setImageHeight(0);
    }
  }, [isCleared, removedBgImage]);
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (downloading) return;
    setDownloading(true);

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
        const originalWidth = compositionRef.current.clientWidth;
        const originalHeight = compositionRef.current.clientHeight;

        // Maximum dimensions for the downloaded image (Full HD)
        const maxWidth = 1920;
        const maxHeight = 1080;

        // Calculate scale factors for width and height to fit within max dimensions
        const scaleWidth = maxWidth / originalWidth;
        const scaleHeight = maxHeight / originalHeight;

        // Use the smaller scale to ensure image fits within both max dimensions
        const scale = Math.min(scaleWidth, scaleHeight, 4); // Cap at 4x for smaller images

        // Calculate final dimensions
        const finalWidth = originalWidth * scale;
        const finalHeight = originalHeight * scale;

        const blob = await domtoimage.toBlob(compositionRef.current, {
          width: finalWidth,
          height: finalHeight,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${finalWidth}px`,
            height: `${finalHeight}px`,
            borderRadius: "0px",
            border: "none",
          },
          filter: (node) => {
            // Exclude the clear button from the download
            if (node instanceof HTMLElement) {
              return node.getAttribute("data-exclude-from-download") !== "true";
            }
            return true;
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
    } finally {
      setDownloading(false);
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
  // Download Modal with Custom Loader (rendered via portal)
  const downloadModal =
    downloading && mounted ? (
      <>
        <style>{`
        .download-loader {
          width: 175px;
          height: 80px;
          display: block;
          margin: auto;
          background-image: radial-gradient(circle 25px at 25px 25px, #FFF 100%, transparent 0), radial-gradient(circle 50px at 50px 50px, #FFF 100%, transparent 0), radial-gradient(circle 25px at 25px 25px, #FFF 100%, transparent 0), linear-gradient(#FFF 50px, transparent 0);
          background-size: 50px 50px, 100px 76px, 50px 50px, 120px 40px;
          background-position: 0px 30px, 37px 0px, 122px 30px, 25px 40px;
          background-repeat: no-repeat;
          position: relative;
          box-sizing: border-box;
        }
        .download-loader::after {
          content: '';
          left: 50%;
          bottom: 0;
          transform: translate(-50%, 0);
          position: absolute;
          border: 15px solid transparent;
          border-top-color: #FF3D00;
          box-sizing: border-box;
          animation: fadePush 1s linear infinite;
        }
        .download-loader::before {
          content: '';
          left: 50%;
          bottom: 30px;
          transform: translate(-50%, 0);
          position: absolute;
          width: 15px;
          height: 15px;
          background: #FF3D00;
          box-sizing: border-box;
          animation: fadePush 1s linear infinite;
        }
        @keyframes fadePush {
          0% {
            transform: translate(-50%, -15px);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, 0px);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, 15px);
            opacity: 0;
          }
        }
      `}</style>
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center"
          style={{
            zIndex: 99999,
            pointerEvents: "auto",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <div
            className="bg-gray-900 rounded-xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className="download-loader"></span>
            <p className="text-white text-center mt-4 text-lg">
              Preparing download...
            </p>
          </div>
        </div>
      </>
    ) : null;

  return (
    <>
      {/* Download Modal rendered via portal to body */}
      {mounted && downloadModal && createPortal(downloadModal, document.body)}
      <div className="w-full backdrop-blur-md dark-card-bg rounded-xl shadow-2xl p-6 flex flex-col gap-6 items-center">
        {/* Preview Header */}
        <div className="w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Preview</h2>
          <p className="text-gray-400 text-sm">
            {resultImage && !isCleared
              ? "Drag the text to reposition it"
              : removedBgImage && !isCleared
              ? "Generate image to add text overlay"
              : "Upload an image to get started"}
          </p>
        </div>

        <div
          ref={compositionRef}
          className={`relative flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden w-full select-none transition-all duration-300 ${
            removedBgImage && !isCleared
              ? "border-2 border-solid border-gray-600/30"
              : "border-2 border-dashed border-gray-600/30"
          } ${
            resultImage && !isCleared && text
              ? isDragging
                ? "cursor-grabbing border-blue-400/50"
                : "cursor-grab border-blue-400/30 hover:border-blue-400/50"
              : "cursor-default hover:border-gray-500/50"
          }`}
          style={{
            width: imageWidth ? `${imageWidth}px` : "100%",
            height: imageHeight ? `${imageHeight}px` : "auto",
            minHeight: "400px",
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          title={
            resultImage && !isCleared && text
              ? "Click and drag to position text"
              : ""
          }
        >
          {/* X Button Overlay - Always Visible */}
          {removedBgImage && !isCleared && onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onRemove();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              className={`absolute top-3 right-3 z-50 w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all duration-200 opacity-100 ${
                downloading ? "hidden" : ""
              }`}
              data-exclude-from-download="true"
              title="Remove Image"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
          {resultImage && !isCleared && outlineEnabled && (
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
                  textAlign: textAlign,
                }}
              >
                {text}
              </h1>
            </div>
          )}

          {/* Text over removedBgImage (when no resultImage yet) - HIDDEN BEFORE GENERATION */}
          {false &&
            removedBgImage &&
            !resultImage &&
            !isCleared &&
            !outlineEnabled && (
              <div
                className={`absolute flex items-center justify-center w-full transition-all duration-150 ${
                  isDragging ? "scale-105 drop-shadow-lg" : ""
                }`}
                style={{
                  ...textPositionStyle,
                  zIndex: 10,
                }}
              >
                <h1
                  className="font-bold whitespace-pre-line"
                  style={{
                    fontSize: `${textSize}px`,
                    color: textColor,
                    lineHeight: lineHeight,
                    textAlign: textAlign,
                    textShadow:
                      textShadow > 0
                        ? `${textShadow * 0.3}px ${textShadow * 0.7}px ${
                            textShadow * 0.5
                          }px rgba(0,0,0,0.3)`
                        : "none",
                  }}
                >
                  {text}
                </h1>
              </div>
            )}

          {resultImage && !isCleared && (
            <div
              className={`absolute flex items-center justify-center w-full transition-all duration-150 ${
                isDragging ? "scale-105 drop-shadow-lg" : ""
              }`}
              style={{
                ...textPositionStyle,
                zIndex: textAboveImage ? 30 : 5,
              }}
            >
              <h1
                className="font-bold whitespace-pre-line"
                style={{
                  fontSize: `${textSize}px`,
                  color: textColor,
                  lineHeight: lineHeight,
                  textAlign: textAlign,
                  textShadow:
                    textShadow > 0
                      ? `${textShadow * 0.3}px ${textShadow * 0.7}px ${
                          textShadow * 0.5
                        }px rgba(0,0,0,0.3)`
                      : "none",
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

          {(!removedBgImage || isCleared) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Upload Your Image
                </h3>
                <p className="text-gray-400 mb-6">
                  Choose an image to remove the background and add text overlay
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
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Choose Image
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col items-center gap-4">
          <div className="w-full max-w-xs flex gap-3">
            {!isGenerated ? (
              // Generate Button
              <Button
                type="button"
                onClick={onGenerate}
                disabled={credits <= 0 || !removedBgImage}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:scale-105"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {credits <= 0
                  ? "No Credits Available"
                  : !removedBgImage
                  ? "Upload Image First"
                  : "Generate Image (1 Credit)"}
              </Button>
            ) : (
              // Download Button
              <Button
                type="button"
                onClick={(e) => handleDownload(e)}
                disabled={!resultImage || downloading}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Preparing download…
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Image
                  </>
                )}
              </Button>
            )}

            {/* Remove Button */}
            {/* {removedBgImage && !isCleared && onRemove && (
            <Button
              type="button"
              onClick={onRemove}
              className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              title="Remove Image"
            >
              <X className="w-5 h-5" />
            </Button>
          )} */}
          </div>

          {!isGenerated && credits <= 0 && removedBgImage && (
            <div className="w-full max-w-xs p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center">
                You need at least 1 credit to generate. Click &quot;Upgrade your
                plan&quot; to buy more.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ImagePreview;
