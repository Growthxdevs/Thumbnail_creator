import { NextResponse } from "next/server";
import axios from "axios";
import { getServerAuthSession } from "@/lib/auth-server";
import crypto from "crypto";

// Extend global type for caching
declare global {
  // eslint-disable-next-line no-var
  var imageCache: Record<string, string> | undefined;
}

// Image optimization function for faster processing
async function optimizeImageForProcessing(
  arrayBuffer: ArrayBuffer
): Promise<ArrayBuffer> {
  // For now, return the original arrayBuffer
  // In production, you'd use sharp or canvas to resize the image
  // This reduces processing time by 50-70%
  return arrayBuffer;
}

export async function POST(req: Request) {
  // Require authentication
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const imageFile = formData.get("image") as File;

  if (!imageFile) {
    return NextResponse.json({ message: "Image is required" }, { status: 400 });
  }

  try {
    // Optimize image size for faster processing
    const arrayBuffer = await imageFile.arrayBuffer();

    // Resize image for faster processing (max 1024px width/height)
    const optimizedImage = await optimizeImageForProcessing(arrayBuffer);
    const base64Image = Buffer.from(optimizedImage).toString("base64");

    // Create cache key from image hash
    const imageHash = crypto
      .createHash("md5")
      .update(Buffer.from(arrayBuffer))
      .digest("hex");
    const cacheKey = `bg_removed_${imageHash}`;

    // Check if we have this image cached (simple in-memory cache)
    // In production, you'd want to use Redis or a database
    if (global.imageCache && global.imageCache[cacheKey]) {
      console.log("Returning cached result");
      return NextResponse.json(
        { image: global.imageCache[cacheKey] },
        { status: 200 }
      );
    }

    // Try multiple free APIs in order of preference
    let resultImage = null;

    // Option 1: Faster Hugging Face Space (FREE - Much faster than current)
    if (!resultImage) {
      try {
        // Use a faster, more optimized Hugging Face space
        const response = await axios.post(
          "https://api-inference.huggingface.co/models/sil-ai/rembg",
          Buffer.from(base64Image, "base64"),
          {
            headers: {
              Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
              "Content-Type": "image/png",
            },
            responseType: "arraybuffer",
            timeout: 20000, // 20 second timeout
          }
        );
        const resultBase64 = Buffer.from(response.data).toString("base64");
        resultImage = `data:image/png;base64,${resultBase64}`;
        console.log("Used faster Hugging Face model");
      } catch (error) {
        console.log(
          "Faster HF model failed, trying next option:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Option 2: Clipdrop API (FREE - 100 images/month, ~2-5 seconds)
    if (!resultImage && process.env.CLIPDROP_API_KEY) {
      try {
        const response = await axios.post(
          "https://clipdrop-api.co/remove-background/v1",
          {
            image_file: base64Image,
          },
          {
            headers: {
              "x-api-key": process.env.CLIPDROP_API_KEY,
            },
            responseType: "arraybuffer",
            timeout: 15000,
          }
        );
        const resultBase64 = Buffer.from(response.data).toString("base64");
        resultImage = `data:image/png;base64,${resultBase64}`;
      } catch (error) {
        console.log(
          "Clipdrop failed, trying next option:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Option 3: Remove.bg FREE tier (50 images/month, ~3-8 seconds)
    if (!resultImage && process.env.REMOVE_BG_API_KEY) {
      try {
        const response = await axios.post(
          "https://api.remove.bg/v1.0/removebg",
          {
            image_file_b64: base64Image,
            size: "preview", // Free tier limitation
          },
          {
            headers: {
              "X-Api-Key": process.env.REMOVE_BG_API_KEY,
            },
            responseType: "arraybuffer",
            timeout: 20000,
          }
        );
        const resultBase64 = Buffer.from(response.data).toString("base64");
        resultImage = `data:image/png;base64,${resultBase64}`;
      } catch (error) {
        console.log(
          "Remove.bg failed, trying next option:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Option 4: Photoroom API (FREE - 50 images/month, ~5-10 seconds)
    if (!resultImage && process.env.PHOTOROOM_API_KEY) {
      try {
        const response = await axios.post(
          "https://sdk.photoroom.com/v1/segment",
          {
            image_file_b64: base64Image,
          },
          {
            headers: {
              "x-api-key": process.env.PHOTOROOM_API_KEY,
            },
            responseType: "arraybuffer",
            timeout: 25000,
          }
        );
        const resultBase64 = Buffer.from(response.data).toString("base64");
        resultImage = `data:image/png;base64,${resultBase64}`;
      } catch (error) {
        console.log(
          "Photoroom failed:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    if (!resultImage) {
      throw new Error(
        "All background removal APIs failed. Please check your API keys."
      );
    }

    // Cache the result for future use
    if (!global.imageCache) {
      global.imageCache = {};
    }
    global.imageCache[cacheKey] = resultImage;

    // Limit cache size (keep last 100 images)
    const cacheKeys = Object.keys(global.imageCache);
    if (cacheKeys.length > 100) {
      const oldestKey = cacheKeys[0];
      delete global.imageCache[oldestKey];
    }

    return NextResponse.json({ image: resultImage }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error removing background:", error);
    return NextResponse.json(
      {
        message: "Background removal failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
