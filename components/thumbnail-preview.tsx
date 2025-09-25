"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Download, Share2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { ThumbnailTemplate } from "@/types/thumbnail";
import domtoimage from "dom-to-image";

interface ThumbnailPreviewProps {
  originalImage: string | null;
  generatedThumbnail: string | null;
  template: ThumbnailTemplate | null;
  onBack: () => void;
  onDownload: () => Promise<boolean>;
  credits: number;
  showHeader?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

export default function ThumbnailPreview({
  originalImage,
  generatedThumbnail,
  template,
  onBack,
  onDownload,
  credits,
  showHeader = true,
  fullWidth = false,
  loading = false,
}: ThumbnailPreviewProps) {
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!generatedThumbnail || credits <= 0) return;

    setDownloading(true);

    try {
      // Deduct credit first
      const creditDeducted = await onDownload();
      if (!creditDeducted) {
        throw new Error("Failed to deduct credit");
      }

      // Create download link
      const link = document.createElement("a");
      link.href = generatedThumbnail;
      link.download = `thumbnail-${
        template?.name.toLowerCase().replace(/\s+/g, "-") || "generated"
      }.png`;
      link.click();

      // Show success notification
      const notification = document.createElement("div");
      notification.textContent = "Thumbnail downloaded successfully!";
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
    } catch (error) {
      console.error("Error downloading thumbnail:", error);

      // Show error notification
      const notification = document.createElement("div");
      notification.textContent =
        "Failed to download thumbnail. Please try again.";
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

  const handleRegenerate = async () => {
    setRegenerating(true);
    // In a real app, this would call the generation API again
    setTimeout(() => {
      setRegenerating(false);
    }, 2000);
  };

  const handleShare = async () => {
    if (navigator.share && generatedThumbnail) {
      try {
        // Convert data URL to blob for sharing
        const response = await fetch(generatedThumbnail);
        const blob = await response.blob();
        const file = new File([blob], "thumbnail.png", { type: "image/png" });

        await navigator.share({
          title: "My AI Generated Thumbnail",
          text: "Check out this thumbnail I created with AI!",
          files: [file],
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        const notification = document.createElement("div");
        notification.textContent = "Link copied to clipboard!";
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
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  return (
    <div className="w-full h-full">
      {/* Header */}
      {showHeader && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Your Thumbnail</h2>
          <p className="text-gray-300">
            Generated with {template?.name} template
          </p>
        </div>
      )}

      <div
        className={`grid gap-6 h-full ${
          fullWidth
            ? "grid-cols-1 lg:grid-cols-2"
            : "grid-cols-1 lg:grid-cols-2"
        }`}
      >
        {/* Original Image */}
        <div className="backdrop-blur-md bg-white/5 rounded-lg shadow-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Original Image
          </h3>
          {originalImage ? (
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={originalImage}
                alt="Original"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
              <div className="text-gray-400 text-center">
                <p className="text-sm">No image uploaded</p>
              </div>
            </div>
          )}
        </div>

        {/* Generated Thumbnail */}
        <div className="backdrop-blur-md bg-white/5 rounded-lg shadow-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Generated Thumbnail
          </h3>
          {generatedThumbnail ? (
            <div
              ref={thumbnailRef}
              className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden"
            >
              <Image
                src={generatedThumbnail}
                alt="Generated Thumbnail"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
              <div className="text-gray-400 text-center">
                {loading ? (
                  <>
                    <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm">Generating thumbnail...</p>
                  </>
                ) : (
                  <p className="text-sm">Select template and generate</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Info */}
      {template && (
        <div className="mt-8 backdrop-blur-md bg-white/5 rounded-lg shadow-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Template Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Template
              </h4>
              <p className="text-white">{template.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Dimensions
              </h4>
              <p className="text-white">
                {template.dimensions.width} × {template.dimensions.height}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Category
              </h4>
              <p className="text-white capitalize">{template.category}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleRegenerate}
          disabled={regenerating || credits <= 0}
          variant="outline"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20 disabled:opacity-50"
        >
          {regenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </>
          )}
        </Button>

        <Button
          onClick={handleShare}
          disabled={!generatedThumbnail}
          variant="outline"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20 disabled:opacity-50"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        <Button
          onClick={handleDownload}
          disabled={!generatedThumbnail || downloading || credits <= 0}
          className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download (1 Credit)
            </>
          )}
        </Button>
      </div>

      {/* Credits Info */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center bg-blue-500/10 rounded-lg px-4 py-2 border border-blue-500/20">
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
          <span className="text-blue-400 text-sm">
            You have {credits} credits remaining
          </span>
        </div>
      </div>
    </div>
  );
}
