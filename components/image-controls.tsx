import React from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import PlanModal from "./plan-modal";
import { fonts } from "@/lib/fonts";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface ImageControlsProps {
  setLoading: (value: boolean) => void;
  credits: number;
  text: string;
  setText: (value: string) => void;
  textSize: number;
  setTextSize: (value: number) => void;
  textColor: string;
  setTextColor: (value: string) => void;
  textOpacity: number;
  setTextOpacity: (value: number) => void;
  horizontalPosition: number;
  setHorizontalPosition: (value: number) => void;
  verticalPosition: number;
  setVerticalPosition: (value: number) => void;

  fontFamily: string;
  setFontFamily: (value: string) => void;
  rotation: number;
  setRotation: (value: number) => void;
  setResultImage: (value: string | null) => void | null;
  removeBgImage: string;
  setRemovedBgImage: (value: string) => void;
  setIsCleared: (value: boolean) => void;
  setIsGenerated: (value: boolean) => void;
  setOriginalFile: (file: File | null) => void;
  setResetFileInput: React.Dispatch<React.SetStateAction<number>>;
  isPro: boolean;
  outlineWidth: number;
  setOutlineWidth: (value: number) => void;
  outlineEnabled: boolean;
  setOutlineEnabled: (value: boolean) => void;
  outlineColor: string;
  setOutlineColor: (value: string) => void;
  outlineTransparency: number;
  setOutlineTransparency: (value: number) => void;
  lineHeight: number;
  setLineHeight: (value: number) => void;
  textAlign: "left" | "center" | "right";
  setTextAlign: (value: "left" | "center" | "right") => void;
  textShadow: number;
  setTextShadow: (value: number) => void;
  textAboveImage: boolean;
  setTextAboveImage: (value: boolean) => void;
  // Fast generation props
  useFastGeneration: boolean;
  setUseFastGeneration: (value: boolean) => void;
  fastGenStatus: {
    isPro: boolean;
    canUse: boolean;
    remainingFastGenerations: number;
    weeklyLimit: number;
    usedThisWeek: number;
    weekStart: string;
  } | null;
}

function ImageControls({
  setLoading,
  credits,
  text,
  setText,
  textSize,
  setTextSize,
  textColor,
  setTextColor,
  textOpacity,
  setTextOpacity,
  horizontalPosition,
  setHorizontalPosition,
  verticalPosition,
  setVerticalPosition,

  fontFamily,
  setFontFamily,
  rotation,
  setRotation,
  setResultImage,
  setRemovedBgImage,
  removeBgImage,
  setIsCleared,
  setIsGenerated,
  setOriginalFile,
  setResetFileInput,
  isPro,
  outlineWidth,
  setOutlineWidth,
  outlineEnabled,
  setOutlineEnabled,
  outlineColor,
  setOutlineColor,
  outlineTransparency,
  setOutlineTransparency,
  lineHeight,
  setLineHeight,
  textAlign,
  setTextAlign,
  textShadow,
  setTextShadow,
  textAboveImage,
  setTextAboveImage,
  useFastGeneration,
  setUseFastGeneration,
  fastGenStatus,
}: ImageControlsProps) {
  const limitedFonts = isPro
    ? Object.keys(fonts) // All fonts for Pro users
    : Object.keys(fonts).slice(0, 5);
  return (
    <div className="w-full md:w-2/5 backdrop-blur-md bg-white/5 p-6 rounded-lg shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-white">
            Available credits:{" "}
            <span className="text-yellow-300 font-bold">{credits}</span>
          </p>
          {credits <= 0 && (
            <p className="text-red-400 text-sm mt-1">
              No credits available. Purchase more to download images.
            </p>
          )}
        </div>
        <PlanModal />
      </div>

      {/* Fast Generation Toggle */}
      {fastGenStatus && (
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-lg border border-blue-400/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fastGeneration"
                checked={useFastGeneration}
                onChange={(e) => setUseFastGeneration(e.target.checked)}
                disabled={!fastGenStatus.canUse && !fastGenStatus.isPro}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="fastGeneration"
                className="text-white font-medium"
              >
                ⚡ Fast Generation
              </label>
            </div>
            {fastGenStatus.isPro ? (
              <span className="text-green-400 text-sm font-semibold">PRO</span>
            ) : (
              <span className="text-yellow-400 text-sm">
                {fastGenStatus.remainingFastGenerations}/
                {fastGenStatus.weeklyLimit}
              </span>
            )}
          </div>

          {fastGenStatus.isPro ? (
            <p className="text-blue-200 text-sm">
              Pro users get unlimited fast generation!
            </p>
          ) : fastGenStatus.canUse ? (
            <p className="text-blue-200 text-sm">
              Use fast generation for quicker processing.{" "}
              {fastGenStatus.remainingFastGenerations} remaining this week.
            </p>
          ) : (
            <p className="text-orange-200 text-sm">
              Fast generation limit reached for this week. Upgrade to Pro for
              unlimited fast generation!
            </p>
          )}
        </div>
      )}

      {removeBgImage && (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={() => {
              setIsCleared(true); // Mark as cleared
              setResultImage(null);
              setRemovedBgImage("");
              setLoading(false);
              setIsGenerated(false); // Reset generated state
              setOriginalFile(null); // Reset original file
              setResetFileInput((prev: number) => prev + 1); // Trigger file input reset
            }}
          >
            Clear
          </Button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Text Content
        </label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 rounded bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your text content here..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Font
        </label>
        <select
          value={fontFamily || ""}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full p-2 rounded bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="" disabled>
            Select a font
          </option>
          {limitedFonts.map((font) => (
            <option
              key={font}
              value={font}
              className={`${fonts[font as keyof typeof fonts]} bg-gray-900`}
            >
              {font}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Text Size: {textSize}px
        </label>
        <input
          type="range"
          min="100"
          max="500"
          value={textSize}
          onChange={(e) => setTextSize(Number(e.target.value))}
          className="w-full accent-dark-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Line Height: {lineHeight.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.8"
          max="3.0"
          step="0.1"
          value={lineHeight}
          onChange={(e) => setLineHeight(Number(e.target.value))}
          className="w-full accent-dark-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Text Alignment
        </label>
        <div className="flex space-x-2">
          {[
            { value: "left", icon: AlignLeft },
            { value: "center", icon: AlignCenter },
            { value: "right", icon: AlignRight },
          ].map((alignment) => (
            <button
              key={alignment.value}
              onClick={() =>
                setTextAlign(alignment.value as "left" | "center" | "right")
              }
              className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors ${
                textAlign === alignment.value
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
              }`}
            >
              <alignment.icon className="w-4 h-4 mr-1 inline" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Text Shadow: {textShadow}px
        </label>
        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={textShadow}
          onChange={(e) => setTextShadow(Number(e.target.value))}
          className="w-full accent-dark-accent-primary"
        />
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={textAboveImage}
            onChange={(e) => setTextAboveImage(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-dark-text-secondary">
            Text Above Image
          </span>
        </label>
        <p className="text-xs text-gray-400 mt-1">
          {textAboveImage
            ? "Text appears on top of the image"
            : "Text appears behind the image"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Text Color
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-12 h-8 rounded bg-transparent"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-28 p-2 rounded bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Outline Controls Section */}
      <div className="border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-200">Outline</label>
          <button
            type="button"
            onClick={() => setOutlineEnabled(!outlineEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              outlineEnabled ? "bg-blue-600" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                outlineEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {outlineEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Outline Width: {outlineWidth}px
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={outlineWidth}
                onChange={(e) => setOutlineWidth(Number(e.target.value))}
                className="w-full accent-dark-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Outline Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  className="w-12 h-8 rounded bg-transparent"
                />
                <input
                  type="text"
                  value={outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  className="w-28 p-2 rounded bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {outlineColor !== textColor && (
                  <button
                    type="button"
                    onClick={() => setOutlineColor(textColor)}
                    className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    title="Reset to text color"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Outline Transparency: {Math.round(outlineTransparency * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={outlineTransparency}
                onChange={(e) => setOutlineTransparency(Number(e.target.value))}
                className="w-full accent-dark-accent-primary"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Text Opacity: {Math.round(textOpacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={textOpacity}
          onChange={(e) => setTextOpacity(Number(e.target.value))}
          className="w-full accent-dark-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Horizontal Position: {Math.round(horizontalPosition)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={horizontalPosition}
          onChange={(e) => setHorizontalPosition(Number(e.target.value))}
          className="w-full accent-dark-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Vertical Position: {Math.round(verticalPosition)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={verticalPosition}
          onChange={(e) => setVerticalPosition(Number(e.target.value))}
          className="w-full accent-dark-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Rotation: {`${rotation}\u00B0`}
        </label>
        <input
          type="range"
          min="-180"
          max="180"
          value={rotation}
          onChange={(e) => setRotation(Number(e.target.value))}
          className="w-full accent-dark-accent-primary"
        />
      </div>
    </div>
  );
}

export default ImageControls;
