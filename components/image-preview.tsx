import { useRef, useState } from "react";
import axios from "axios";
import { Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import domtoimage from "dom-to-image";

type ImagePreviewProps = {
  loading: boolean;
  setLoading: (value: boolean) => void;
  textPositionStyle: React.CSSProperties;
  text: string;
  textSize: number;
  textColor: string;
  resultImage: string | null;
  setResultImage: (value: string) => void;
  removedBgImage: string;
  setRemovedBgImage: (value: string) => void;
  isCleared: boolean;
  setIsCleared: (value: boolean) => void;
};

function ImagePreview({
  loading,
  setLoading,
  textPositionStyle,
  text,
  textSize,
  textColor,
  resultImage,
  setResultImage,
  removedBgImage,
  setRemovedBgImage,
  isCleared,
  setIsCleared,
}: ImagePreviewProps) {
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  const compositionRef = useRef<HTMLDivElement>(null);
  const handleSubmit = async (file: File) => {
    setLoading(true);
    setIsCleared(false); // Reset clear flag when submitting a new file

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post("/api/removeBg", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        setResultImage(response.data.image);
      } else {
        console.error("Error:", response.data.message);
      }
    } catch (error: unknown) {
      console.error(
        "Unexpected Error:",
        (error as { response?: { data?: string } })?.response?.data ||
          (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = async () => {
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
        link.href = URL.createObjectURL(blob);
        link.download = "edited-image.png";
        link.click();
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("An error occurred while generating the image. Please try again.");
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
    <div className="w-full md:w-3/5 backdrop-blur-md bg-white/5 rounded-lg shadow-2xl p-4 flex flex-col gap-4 items-center">
      <div
        ref={compositionRef}
        className="relative flex min-h-[100px] items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden w-full"
        style={{
          width: imageWidth ? `${imageWidth}px` : "100%",
          height: imageHeight ? `${imageHeight}px` : "400px",
        }}
      >
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}

        {removedBgImage && !isCleared && (
          <img
            src={removedBgImage}
            alt="Subject"
            onLoad={handleImageLoad}
            className="absolute inset-0 object-contain"
          />
        )}

        {resultImage && !isCleared && (
          <div
            className="absolute flex items-center justify-center z-10 w-full"
            style={textPositionStyle}
          >
            <h1
              className="font-bold"
              style={{
                fontSize: `${textSize}px`,
                color: textColor,
              }}
            >
              {text}
            </h1>
          </div>
        )}

        {resultImage && !isCleared && (
          <img
            src={resultImage}
            alt="Processed Image"
            className="absolute inset-0 object-contain z-20"
          />
        )}

        {!removedBgImage && (
          <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-500/30">
            <div className="text-center p-6">
              <p className="text-gray-300">
                Upload your transparent background image (PNG)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setRemovedBgImage(URL.createObjectURL(file));
                    handleSubmit(file);
                  }
                }}
                className="mt-4 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          onClick={handleDownload}
          disabled={!resultImage}
          variant="outline"
          className="flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
        >
          <Download className="w-4 h-4" />
          Download Image
        </Button>
      </div>
    </div>
  );
}

export default ImagePreview;
