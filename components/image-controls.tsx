import React from "react";
import { Button } from "./ui/button";
import PlanModal from "./plan-modal";
import { fonts } from "@/lib/fonts";

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
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 rounded bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
