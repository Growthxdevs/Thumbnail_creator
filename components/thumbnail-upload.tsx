"use client";
import React, { useState } from "react";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

interface ThumbnailUploadProps {
  onImageUpload: (imageUrl: string) => void;
  credits: number;
  showHeader?: boolean;
  compact?: boolean;
}

export default function ThumbnailUpload({
  onImageUpload,
  credits,
  showHeader = true,
  compact = false,
}: ThumbnailUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    // Create object URL for preview
    const imageUrl = URL.createObjectURL(file);

    // Simulate upload delay
    setTimeout(() => {
      setUploading(false);
      onImageUpload(imageUrl);
    }, 1000);
  };

  return (
    <div className="w-full">
      {showHeader && (
        <div className="text-center mb-4">
          <h2
            className={`font-bold text-white mb-1 ${
              compact ? "text-lg" : "text-2xl"
            }`}
          >
            Upload Your Image
          </h2>
          <p className={`text-gray-300 ${compact ? "text-xs" : "text-sm"}`}>
            Choose a high-quality image
          </p>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg text-center transition-colors ${
          compact ? "p-6" : "p-12"
        } ${
          dragActive
            ? "border-blue-400 bg-blue-500/10"
            : "border-gray-500/50 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div
              className={`border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2 ${
                compact ? "w-8 h-8" : "w-16 h-16"
              }`}
            ></div>
            <p className={`text-white ${compact ? "text-sm" : "text-base"}`}>
              Uploading...
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <div
                className={`bg-gray-700/50 rounded-full flex items-center justify-center mb-3 ${
                  compact ? "w-12 h-12" : "w-20 h-20"
                }`}
              >
                <ImageIcon
                  className={`text-gray-400 ${
                    compact ? "w-6 h-6" : "w-10 h-10"
                  }`}
                />
              </div>
              <h3
                className={`font-semibold text-white mb-1 ${
                  compact ? "text-sm" : "text-xl"
                }`}
              >
                {compact ? "Drop image here" : "Drag & drop your image here"}
              </h3>
              <p
                className={`text-gray-400 mb-3 ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                or click to browse
              </p>
              <Button
                variant="outline"
                size={compact ? "sm" : "default"}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Upload className={`mr-2 ${compact ? "w-3 h-3" : "w-4 h-4"}`} />
                Choose File
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-center justify-center text-red-400">
          <AlertCircle className="w-3 h-3 mr-1" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* File Requirements */}
      {!compact && (
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-xs mb-1">
            Supported: JPG, PNG, WebP
          </p>
          <p className="text-gray-400 text-xs">Max size: 10MB</p>
        </div>
      )}

      {/* Credits Info */}
      <div
        className={`mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 ${
          compact ? "p-2" : "p-3"
        }`}
      >
        <div className="flex items-center justify-center text-blue-400">
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
          <span className={`${compact ? "text-xs" : "text-sm"}`}>
            {credits} credits available
          </span>
        </div>
      </div>
    </div>
  );
}
