import React from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import PlanModal from "./plan-modal";
import { fonts } from "@/lib/fonts";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Copy,
} from "lucide-react";
import { TextElement } from "./remove-background";

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
  // Fast generation status (read-only, automatically determined by server)
  fastGenStatus: {
    isPro: boolean;
    canUse: boolean;
    remainingFastGenerations: number;
    weeklyLimit: number;
    usedThisWeek: number;
    weekStart: string;
  } | null;
  // Multiple text elements support
  textElements?: TextElement[];
  selectedTextId?: string;
  onTextElementUpdate?: (id: string, updates: Partial<TextElement>) => void;
  onTextElementSelect?: (id: string) => void;
  onAddTextElement?: () => void;
  onRemoveTextElement?: (id: string) => void;
  onCopyTextElement?: (id: string) => void;
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
  fastGenStatus,
  textElements,
  selectedTextId,
  onTextElementUpdate,
  onTextElementSelect,
  onAddTextElement,
  onRemoveTextElement,
  onCopyTextElement,
}: ImageControlsProps) {
  const limitedFonts = isPro
    ? Object.keys(fonts) // All fonts for Pro users
    : Object.keys(fonts).slice(0, 5);

  // Get selected text element or use legacy props
  const selectedText = textElements?.find((el) => el.id === selectedTextId);
  const isUsingMultipleTexts = textElements && textElements.length > 0;

  // Helper function to update selected text element
  const updateSelectedText = (updates: Partial<TextElement>) => {
    if (isUsingMultipleTexts && selectedTextId && onTextElementUpdate) {
      onTextElementUpdate(selectedTextId, updates);
    }
  };

  return (
    <div className="w-full backdrop-blur-md bg-white/5 p-6 rounded-xl shadow-2xl space-y-6">
      {/* Controls Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Controls</h2>
        <p className="text-gray-400 text-sm">Customize your image</p>
      </div>

      {/* Text Elements List - Show when using multiple texts */}
      {isUsingMultipleTexts && textElements && (
        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              Text Elements ({textElements.length})
            </h3>
            {onAddTextElement && (
              <Button
                onClick={onAddTextElement}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                title="Add new text element"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Text
              </Button>
            )}
          </div>
          <>
            <style>{`
              .text-elements-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .text-elements-scrollbar::-webkit-scrollbar-track {
                background: rgba(31, 41, 55, 0.5);
                border-radius: 10px;
              }
              .text-elements-scrollbar::-webkit-scrollbar-thumb {
                background: #4B5563;
                border-radius: 10px;
                border: 2px solid rgba(31, 41, 55, 0.5);
                transition: background 0.2s ease;
              }
              .text-elements-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #6B7280;
              }
              .text-elements-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #4B5563 rgba(31, 41, 55, 0.5);
              }
            `}</style>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-elements-scrollbar">
              {textElements.map((textEl) => (
                <div
                  key={textEl.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedTextId === textEl.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 bg-gray-700/30 hover:bg-gray-700/50"
                  }`}
                  onClick={() => onTextElementSelect?.(textEl.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {textEl.text || "Empty text"}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Size: {textEl.textSize}px • {textEl.fontFamily}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {onCopyTextElement && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopyTextElement(textEl.id);
                          }}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors"
                          title="Copy text element"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      {onRemoveTextElement && textElements.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveTextElement(textEl.id);
                          }}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                          title="Remove text element"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        </div>
      )}
      {/* Credits Section */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-lg border border-yellow-500/20">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-white font-medium">
              Available credits:{" "}
              <span className="text-yellow-300 font-bold text-xl">
                {credits}
              </span>
            </p>
            {credits <= 0 && (
              <p className="text-red-400 text-sm mt-1">
                No credits available. Purchase more to download images.
              </p>
            )}
          </div>
          <PlanModal />
        </div>
      </div>

      {/* Fast Generation Status - Only show for non-Pro users */}
      {fastGenStatus && !fastGenStatus.isPro && (
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-lg border border-blue-400/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Fast Generation</span>
            </div>
            <span className="text-yellow-400 text-sm">
              ⚡{fastGenStatus.remainingFastGenerations}/
              {fastGenStatus.weeklyLimit}
            </span>
          </div>

          <p className="text-blue-200 text-sm">
            You have 3 fast generations per week.{" "}
            {fastGenStatus.remainingFastGenerations} remaining this week.
          </p>
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
              setText("Text"); // Reset text to default
            }}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Text Content Section */}
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          Text Content
          {/* {isUsingMultipleTexts && selectedText && (
            <span className="text-xs text-gray-400 ml-2">
              (Editing: {selectedText.text.substring(0, 20)}
              {selectedText.text.length > 20 ? "..." : ""})
            </span>
          )} */}
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enter your text
          </label>
          <Textarea
            value={
              isUsingMultipleTexts && selectedText ? selectedText.text : text
            }
            onChange={(e) => {
              if (isUsingMultipleTexts) {
                updateSelectedText({ text: e.target.value });
              } else {
                setText(e.target.value);
              }
            }}
            className="w-full p-3 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your text content here..."
            rows={3}
          />
        </div>
      </div>

      {/* Typography Section */}
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          Typography
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Font Family
            </label>
            <select
              value={
                isUsingMultipleTexts && selectedText
                  ? selectedText.fontFamily
                  : fontFamily || ""
              }
              onChange={(e) => {
                if (isUsingMultipleTexts) {
                  updateSelectedText({ fontFamily: e.target.value });
                } else {
                  setFontFamily(e.target.value);
                }
              }}
              className="w-full p-3 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Text Size:{" "}
              {isUsingMultipleTexts && selectedText
                ? selectedText.textSize
                : textSize}
              px
            </label>
            <input
              type="range"
              min="8"
              max="500"
              value={Math.max(
                8,
                isUsingMultipleTexts && selectedText
                  ? selectedText.textSize
                  : textSize
              )}
              onChange={(e) => {
                const newSize = Math.max(8, Number(e.target.value));
                if (isUsingMultipleTexts) {
                  updateSelectedText({ textSize: newSize });
                } else {
                  setTextSize(newSize);
                }
              }}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Line Height:{" "}
          {(isUsingMultipleTexts && selectedText
            ? selectedText.lineHeight
            : lineHeight
          ).toFixed(1)}
        </label>
        <input
          type="range"
          min="0.8"
          max="3.0"
          step="0.1"
          value={
            isUsingMultipleTexts && selectedText
              ? selectedText.lineHeight
              : lineHeight
          }
          onChange={(e) => {
            if (isUsingMultipleTexts) {
              updateSelectedText({ lineHeight: Number(e.target.value) });
            } else {
              setLineHeight(Number(e.target.value));
            }
          }}
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
          ].map((alignment) => {
            const currentAlign =
              isUsingMultipleTexts && selectedText
                ? selectedText.textAlign
                : textAlign;
            return (
              <button
                key={alignment.value}
                onClick={() => {
                  if (isUsingMultipleTexts) {
                    updateSelectedText({
                      textAlign: alignment.value as "left" | "center" | "right",
                    });
                  } else {
                    setTextAlign(
                      alignment.value as "left" | "center" | "right"
                    );
                  }
                }}
                className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors ${
                  currentAlign === alignment.value
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                <alignment.icon className="w-4 h-4 mr-1 inline" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Text Shadow:{" "}
          {isUsingMultipleTexts && selectedText
            ? selectedText.textShadow
            : textShadow}
          px
        </label>
        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={
            isUsingMultipleTexts && selectedText
              ? selectedText.textShadow
              : textShadow
          }
          onChange={(e) => {
            if (isUsingMultipleTexts) {
              updateSelectedText({ textShadow: Number(e.target.value) });
            } else {
              setTextShadow(Number(e.target.value));
            }
          }}
          className="w-full accent-dark-accent-primary"
        />
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={
              isUsingMultipleTexts && selectedText
                ? selectedText.textAboveImage
                : textAboveImage
            }
            onChange={(e) => {
              if (isUsingMultipleTexts) {
                updateSelectedText({ textAboveImage: e.target.checked });
              } else {
                setTextAboveImage(e.target.checked);
              }
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-dark-text-secondary">
            Text Above Image
          </span>
        </label>
        <p className="text-xs text-gray-400 mt-1">
          {(
            isUsingMultipleTexts && selectedText
              ? selectedText.textAboveImage
              : textAboveImage
          )
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
            value={
              isUsingMultipleTexts && selectedText
                ? selectedText.textColor
                : textColor
            }
            onChange={(e) => {
              if (isUsingMultipleTexts) {
                updateSelectedText({ textColor: e.target.value });
              } else {
                setTextColor(e.target.value);
              }
            }}
            className="w-12 h-8 rounded bg-transparent"
          />
          <input
            type="text"
            value={
              isUsingMultipleTexts && selectedText
                ? selectedText.textColor
                : textColor
            }
            onChange={(e) => {
              if (isUsingMultipleTexts) {
                updateSelectedText({ textColor: e.target.value });
              } else {
                setTextColor(e.target.value);
              }
            }}
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
            onClick={() => {
              const newValue = !(isUsingMultipleTexts && selectedText
                ? selectedText.outlineEnabled
                : outlineEnabled);
              if (isUsingMultipleTexts) {
                updateSelectedText({ outlineEnabled: newValue });
              } else {
                setOutlineEnabled(newValue);
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              (
                isUsingMultipleTexts && selectedText
                  ? selectedText.outlineEnabled
                  : outlineEnabled
              )
                ? "bg-blue-600"
                : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                (
                  isUsingMultipleTexts && selectedText
                    ? selectedText.outlineEnabled
                    : outlineEnabled
                )
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {(isUsingMultipleTexts && selectedText
          ? selectedText.outlineEnabled
          : outlineEnabled) && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Outline Width:{" "}
                {isUsingMultipleTexts && selectedText
                  ? selectedText.outlineWidth
                  : outlineWidth}
                px
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={
                  isUsingMultipleTexts && selectedText
                    ? selectedText.outlineWidth
                    : outlineWidth
                }
                onChange={(e) => {
                  if (isUsingMultipleTexts) {
                    updateSelectedText({
                      outlineWidth: Number(e.target.value),
                    });
                  } else {
                    setOutlineWidth(Number(e.target.value));
                  }
                }}
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
                  value={
                    isUsingMultipleTexts && selectedText
                      ? selectedText.outlineColor
                      : outlineColor
                  }
                  onChange={(e) => {
                    if (isUsingMultipleTexts) {
                      updateSelectedText({ outlineColor: e.target.value });
                    } else {
                      setOutlineColor(e.target.value);
                    }
                  }}
                  className="w-12 h-8 rounded bg-transparent"
                />
                <input
                  type="text"
                  value={
                    isUsingMultipleTexts && selectedText
                      ? selectedText.outlineColor
                      : outlineColor
                  }
                  onChange={(e) => {
                    if (isUsingMultipleTexts) {
                      updateSelectedText({ outlineColor: e.target.value });
                    } else {
                      setOutlineColor(e.target.value);
                    }
                  }}
                  className="w-28 p-2 rounded bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {(isUsingMultipleTexts && selectedText
                  ? selectedText.outlineColor
                  : outlineColor) !==
                  (isUsingMultipleTexts && selectedText
                    ? selectedText.textColor
                    : textColor) && (
                  <button
                    type="button"
                    onClick={() => {
                      const textColorValue =
                        isUsingMultipleTexts && selectedText
                          ? selectedText.textColor
                          : textColor;
                      if (isUsingMultipleTexts) {
                        updateSelectedText({ outlineColor: textColorValue });
                      } else {
                        setOutlineColor(textColorValue);
                      }
                    }}
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
                Outline Transparency:{" "}
                {Math.round(
                  (isUsingMultipleTexts && selectedText
                    ? selectedText.outlineTransparency
                    : outlineTransparency) * 100
                )}
                %
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={
                  isUsingMultipleTexts && selectedText
                    ? selectedText.outlineTransparency
                    : outlineTransparency
                }
                onChange={(e) => {
                  if (isUsingMultipleTexts) {
                    updateSelectedText({
                      outlineTransparency: Number(e.target.value),
                    });
                  } else {
                    setOutlineTransparency(Number(e.target.value));
                  }
                }}
                className="w-full accent-dark-accent-primary"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Text Opacity:{" "}
          {Math.round(
            (isUsingMultipleTexts && selectedText
              ? selectedText.textOpacity
              : textOpacity) * 100
          )}
          %
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={
            isUsingMultipleTexts && selectedText
              ? selectedText.textOpacity
              : textOpacity
          }
          onChange={(e) => {
            if (isUsingMultipleTexts) {
              updateSelectedText({ textOpacity: Number(e.target.value) });
            } else {
              setTextOpacity(Number(e.target.value));
            }
          }}
          className="w-full accent-dark-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Horizontal Position:{" "}
          {Math.round(
            isUsingMultipleTexts && selectedText
              ? selectedText.horizontalPosition
              : horizontalPosition
          )}
          %
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={
            isUsingMultipleTexts && selectedText
              ? selectedText.horizontalPosition
              : horizontalPosition
          }
          onChange={(e) => {
            const newValue = Number(e.target.value);
            if (isUsingMultipleTexts) {
              updateSelectedText({ horizontalPosition: newValue });
            } else {
              setHorizontalPosition(newValue);
            }
          }}
          className="w-full accent-dark-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Vertical Position:{" "}
          {Math.round(
            isUsingMultipleTexts && selectedText
              ? selectedText.verticalPosition
              : verticalPosition
          )}
          %
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={
            isUsingMultipleTexts && selectedText
              ? selectedText.verticalPosition
              : verticalPosition
          }
          onChange={(e) => {
            const newValue = Number(e.target.value);
            if (isUsingMultipleTexts) {
              updateSelectedText({ verticalPosition: newValue });
            } else {
              setVerticalPosition(newValue);
            }
          }}
          className="w-full accent-dark-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Rotation:{" "}
          {`${
            isUsingMultipleTexts && selectedText
              ? selectedText.rotation
              : rotation
          }\u00B0`}
        </label>
        <input
          type="range"
          min="-180"
          max="180"
          value={
            isUsingMultipleTexts && selectedText
              ? selectedText.rotation
              : rotation
          }
          onChange={(e) => {
            if (isUsingMultipleTexts) {
              updateSelectedText({ rotation: Number(e.target.value) });
            } else {
              setRotation(Number(e.target.value));
            }
          }}
          className="w-full accent-dark-accent-primary"
        />
      </div>
    </div>
  );
}

export default ImageControls;
