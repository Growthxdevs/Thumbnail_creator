"use client";
import React, { useState } from "react";
import { Sparkles, Play, Youtube, Instagram } from "lucide-react";
import { Button } from "./ui/button";
import { ThumbnailTemplate } from "@/types/thumbnail";

interface TemplateSelectorProps {
  onTemplateSelect: (template: ThumbnailTemplate) => void;
  onGenerate: () => void;
  onBack: () => void;
  selectedTemplate: ThumbnailTemplate | null;
  loading: boolean;
  credits: number;
  showHeader?: boolean;
  compact?: boolean;
}

// Mock template data - in a real app, this would come from an API
const thumbnailTemplates: ThumbnailTemplate[] = [
  {
    id: "youtube-bold",
    name: "Bold YouTube",
    description: "High contrast, attention-grabbing design perfect for YouTube",
    category: "youtube",
    preview: "/api/placeholder/400/225",
    style: {
      backgroundColor: "#ff0000",
      textColor: "#ffffff",
      fontSize: 48,
      fontFamily: "Impact",
      textPosition: "center",
      overlay: true,
      border: true,
      shadow: true,
    },
    dimensions: { width: 1280, height: 720 },
    trending: true,
  },
  {
    id: "reels-vibrant",
    name: "Vibrant Reels",
    description: "Colorful and energetic design for Instagram Reels",
    category: "reels",
    preview: "/api/placeholder/400/400",
    style: {
      backgroundColor: "#ff6b6b",
      textColor: "#ffffff",
      fontSize: 36,
      fontFamily: "Arial",
      textPosition: "top",
      overlay: false,
      border: false,
      shadow: true,
    },
    dimensions: { width: 1080, height: 1080 },
    trending: true,
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Clean and simple design that works for any platform",
    category: "general",
    preview: "/api/placeholder/400/225",
    style: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      fontSize: 42,
      fontFamily: "Helvetica",
      textPosition: "center",
      overlay: false,
      border: true,
      shadow: false,
    },
    dimensions: { width: 1280, height: 720 },
    trending: false,
  },
  {
    id: "dark-mystery",
    name: "Dark Mystery",
    description: "Mysterious dark theme with glowing effects",
    category: "general",
    preview: "/api/placeholder/400/225",
    style: {
      backgroundColor: "#1a1a1a",
      textColor: "#00ff88",
      fontSize: 44,
      fontFamily: "Arial",
      textPosition: "bottom",
      overlay: true,
      border: false,
      shadow: true,
    },
    dimensions: { width: 1280, height: 720 },
    trending: true,
  },
  {
    id: "youtube-gaming",
    name: "Gaming Style",
    description: "Perfect for gaming content with neon accents",
    category: "youtube",
    preview: "/api/placeholder/400/225",
    style: {
      backgroundColor: "#0f0f23",
      textColor: "#00ffff",
      fontSize: 46,
      fontFamily: "Impact",
      textPosition: "center",
      overlay: true,
      border: true,
      shadow: true,
    },
    dimensions: { width: 1280, height: 720 },
    trending: true,
  },
  {
    id: "reels-fashion",
    name: "Fashion Reels",
    description: "Elegant design perfect for fashion and lifestyle content",
    category: "reels",
    preview: "/api/placeholder/400/400",
    style: {
      backgroundColor: "#f8f8f8",
      textColor: "#333333",
      fontSize: 38,
      fontFamily: "Georgia",
      textPosition: "top",
      overlay: false,
      border: true,
      shadow: false,
    },
    dimensions: { width: 1080, height: 1080 },
    trending: false,
  },
];

export default function TemplateSelector({
  onTemplateSelect,
  onGenerate,
  onBack,
  selectedTemplate,
  loading,
  credits,
  showHeader = true,
  compact = false,
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "youtube" | "reels" | "general"
  >("all");

  const filteredTemplates =
    selectedCategory === "all"
      ? thumbnailTemplates
      : thumbnailTemplates.filter(
          (template) => template.category === selectedCategory
        );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "youtube":
        return <Youtube className="w-4 h-4" />;
      case "reels":
        return <Instagram className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      {showHeader && (
        <div className="text-center mb-4">
          <h2
            className={`font-bold text-white mb-1 ${
              compact ? "text-lg" : "text-2xl"
            }`}
          >
            Choose Template
          </h2>
          <p className={`text-gray-300 ${compact ? "text-xs" : "text-sm"}`}>
            Select from trending designs
          </p>
        </div>
      )}

      {/* Category Filter */}
      <div className={`flex justify-center mb-4 ${compact ? "mb-3" : "mb-4"}`}>
        <div
          className={`flex space-x-1 bg-white/5 rounded-lg p-1 ${
            compact ? "p-0.5" : "p-1"
          }`}
        >
          {[
            { key: "all", label: compact ? "All" : "All Templates" },
            { key: "youtube", label: "YouTube" },
            { key: "reels", label: "Reels" },
            { key: "general", label: "General" },
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key as any)}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                compact ? "text-xs" : "text-sm"
              } ${
                selectedCategory === category.key
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div
        className={`grid gap-3 mb-4 ${
          compact
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        }`}
      >
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`relative backdrop-blur-md dark-card-bg rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all ${
              compact ? "p-2" : "p-0"
            } ${
              selectedTemplate?.id === template.id
                ? "ring-2 ring-dark-accent-primary bg-dark-accent-primary/10"
                : "hover:bg-dark-bg-secondary/50"
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            {/* Trending Badge */}
            {template.trending && (
              <div className="absolute top-1 left-1 z-10">
                <div
                  className={`flex items-center bg-orange-500 text-white px-1 py-0.5 rounded-full font-medium ${
                    compact ? "text-xs" : "text-xs"
                  }`}
                >
                  <Sparkles
                    className={`mr-1 ${compact ? "w-2 h-2" : "w-3 h-3"}`}
                  />
                  {compact ? "Hot" : "Trending"}
                </div>
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-1 right-1 z-10">
              <div
                className={`flex items-center bg-gray-800/80 text-white px-1 py-0.5 rounded-full ${
                  compact ? "text-xs" : "text-xs"
                }`}
              >
                {getCategoryIcon(template.category)}
                <span
                  className={`ml-1 capitalize ${compact ? "hidden" : "block"}`}
                >
                  {template.category}
                </span>
              </div>
            </div>

            {/* Template Preview */}
            <div
              className={`bg-gray-800 flex items-center justify-center ${
                compact ? "h-16 rounded" : "aspect-video"
              }`}
            >
              <div
                className={`w-full h-full flex items-center justify-center text-white font-bold ${
                  compact ? "text-sm" : "text-2xl"
                }`}
                style={{
                  backgroundColor: template.style.backgroundColor,
                  color: template.style.textColor,
                }}
              >
                {compact ? template.name.split(" ")[0] : template.name}
              </div>
            </div>

            {/* Template Info */}
            {!compact && (
              <div className="p-3">
                <h3 className="text-sm font-semibold text-white mb-1">
                  {template.name}
                </h3>
                <p className="text-gray-300 text-xs mb-1">
                  {template.description}
                </p>
                <div className="text-xs text-gray-400">
                  {template.dimensions.width} × {template.dimensions.height}
                </div>
              </div>
            )}

            {/* Selection Indicator */}
            {selectedTemplate?.id === template.id && (
              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                <div
                  className={`bg-blue-500 text-white px-2 py-1 rounded-full font-medium ${
                    compact ? "text-xs" : "text-sm"
                  }`}
                >
                  {compact ? "✓" : "Selected"}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={onGenerate}
          disabled={!selectedTemplate || loading || credits <= 0}
          size={compact ? "sm" : "default"}
          className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
            compact ? "py-2 text-sm" : "px-8 py-3 text-lg"
          }`}
        >
          {loading ? (
            <>
              <div
                className={`border-2 border-white border-t-transparent rounded-full animate-spin mr-2 ${
                  compact ? "w-3 h-3" : "w-5 h-5"
                }`}
              ></div>
              {compact ? "Generating..." : "Generating Thumbnail..."}
            </>
          ) : (
            <>
              <Sparkles className={`mr-2 ${compact ? "w-3 h-3" : "w-5 h-5"}`} />
              {compact
                ? "Generate (1 Credit)"
                : "Generate Thumbnail (1 Credit)"}
            </>
          )}
        </Button>

        {credits <= 0 && (
          <p className={`text-red-400 mt-2 ${compact ? "text-xs" : "text-sm"}`}>
            Need credits to generate
          </p>
        )}
      </div>
    </div>
  );
}
