"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCreditStore } from "@/stores/credit-store";
import { useCreditInit } from "@/hooks/use-credit-init";
import ThumbnailUpload from "./thumbnail-upload";
import TemplateSelector from "./template-selector";
import ThumbnailPreview from "./thumbnail-preview";
import { ThumbnailTemplate } from "@/types/thumbnail";

export default function ThumbnailGenerator() {
  const { data: session } = useSession();
  const { credits, deductCredits } = useCreditStore();
  useCreditInit(); // Initialize credits from session

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ThumbnailTemplate | null>(null);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Get user pro status from session
  const isPro = session?.user?.isPro ?? false;

  // Function to handle credit deduction
  const handleCreditDeduction = async () => {
    if (credits <= 0) {
      console.log("Client-side validation: No credits available");
      return false;
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
        deductCredits(1);
        console.log("Credit deducted successfully, new balance:", data.credits);
        return true;
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

  // Function to generate thumbnail with AI
  const handleGenerateThumbnail = async () => {
    if (!uploadedImage || !selectedTemplate) return;

    setLoading(true);
    try {
      const response = await fetch("/api/thumbnail/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: uploadedImage,
          template: selectedTemplate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedThumbnail(data.thumbnail);
        setCurrentStep("preview");
      } else {
        throw new Error("Failed to generate thumbnail");
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      // Show error notification
      const notification = document.createElement("div");
      notification.textContent =
        "Failed to generate thumbnail. Please try again.";
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

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
  };

  const handleTemplateSelect = (template: ThumbnailTemplate) => {
    setSelectedTemplate(template);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setSelectedTemplate(null);
    setGeneratedThumbnail(null);
  };

  return (
    <div className="w-full min-h-screen p-8">
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 font-dancing">
            AI Thumbnail Generator
          </h1>
          <p className="text-gray-300 text-lg">
            Create stunning thumbnails for YouTube and Reels with AI-powered
            templates
          </p>
        </div>

        {/* Main Content - Modern Layout */}
        <div className="max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Controls */}
            <div className="lg:col-span-1 space-y-4">
              {/* Upload Section */}
              <div className="backdrop-blur-md bg-white/5 rounded-lg shadow-xl p-4">
                <ThumbnailUpload
                  onImageUpload={handleImageUpload}
                  credits={credits}
                  showHeader={true}
                  compact={true}
                />
              </div>

              {/* Template Selection Section */}
              <div className="backdrop-blur-md bg-white/5 rounded-lg shadow-xl p-4">
                <TemplateSelector
                  onTemplateSelect={handleTemplateSelect}
                  onGenerate={handleGenerateThumbnail}
                  onBack={handleReset}
                  selectedTemplate={selectedTemplate}
                  loading={loading}
                  credits={credits}
                  showHeader={true}
                  compact={true}
                />
              </div>

              {/* Reset Button */}
              {(uploadedImage || selectedTemplate || generatedThumbnail) && (
                <div className="text-center">
                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Start Over
                  </button>
                </div>
              )}
            </div>

            {/* Right Side - Preview & Output */}
            <div className="lg:col-span-2">
              <div className="backdrop-blur-md bg-white/5 rounded-lg shadow-xl p-6 h-full">
                <ThumbnailPreview
                  originalImage={uploadedImage}
                  generatedThumbnail={generatedThumbnail}
                  template={selectedTemplate}
                  onBack={handleReset}
                  onDownload={handleCreditDeduction}
                  credits={credits}
                  showHeader={true}
                  fullWidth={true}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
