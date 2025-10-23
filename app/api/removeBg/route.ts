import { NextResponse } from "next/server";
import axios from "axios";
import { getServerAuthSession } from "@/lib/auth-server";
import {
  canUseFastGeneration,
  recordFastGenerationUsage,
} from "@/lib/fast-generation-utils";
import crypto from "crypto";

// Extend global type for caching
declare global {
  // eslint-disable-next-line no-var
  var imageCache: Record<string, string> | undefined;
}

export async function POST(req: Request) {
  // Require authentication
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const imageFile = formData.get("image") as File;
  // Fast generation is automatically determined based on user status and availability

  if (!imageFile) {
    return NextResponse.json({ message: "Image is required" }, { status: 400 });
  }

  // Check if user can use fast generation
  const fastGenStatus = await canUseFastGeneration(
    session.user.id,
    session.user.isPro || false
  );

  console.log("Fast generation status:", {
    userId: session.user.id,
    isPro: session.user.isPro || false,
    canUse: fastGenStatus.canUse,
    remaining: fastGenStatus.remainingFastGenerations,
    weeklyLimit: fastGenStatus.weeklyLimit,
  });

  // Fast generation is automatically determined based on user status and availability

  try {
    // Use original image for better quality
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // Determine processing speed based on user tier and fast generation availability
    // Pro users: Always use fast generation
    // Non-pro users: Use fast generation if available, otherwise use standard
    const shouldUseFastGeneration = fastGenStatus.isPro || fastGenStatus.canUse;

    // Create cache key from image hash
    const imageHash = crypto
      .createHash("md5")
      .update(Buffer.from(arrayBuffer))
      .digest("hex");
    const cacheKey = `bg_removed_${imageHash}`;

    // Check if we have this image cached (simple in-memory cache)
    // In production, you'd want to use Redis or a database
    if (false && global.imageCache && global.imageCache[cacheKey]) {
      console.log("Found cached result, but checking if delay is needed...");

      // Even for cached results, we need to apply delay for non-pro users who have exhausted their quota
      if (!shouldUseFastGeneration) {
        console.log("Adding delay for non-pro users (cached result)...");
        const delayTime = 20000 + Math.random() * 5000; // 20-25 seconds
        console.log(`Delay time: ${delayTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, delayTime));
        console.log("Delay completed");
      }

      // Record fast generation usage if applicable (only for non-pro users)
      // This happens for both cached and non-cached results
      if (shouldUseFastGeneration && !fastGenStatus.isPro) {
        console.log("Recording fast generation usage for cached result...");
        await recordFastGenerationUsage(session.user.id);
      }

      // Get updated fast generation status for non-pro users
      let updatedFastGenStatus = fastGenStatus;
      if (!fastGenStatus.isPro) {
        // Re-fetch the fast generation status after recording usage
        const { canUseFastGeneration } = await import(
          "@/lib/fast-generation-utils"
        );
        updatedFastGenStatus = await canUseFastGeneration(
          session.user.id,
          false
        );
      }

      // Get current user credits for the response
      const { db } = await import("@/lib/prisma");
      const { safeDbOperation } = await import("@/lib/db-utils");
      const currentUser = await safeDbOperation(async () => {
        return await db.user.findUnique({
          where: { id: session.user.id },
          select: { credits: true },
        });
      });

      console.log("Returning cached result");
      return NextResponse.json(
        {
          image: global.imageCache[cacheKey],
          fastGenerationUsed: shouldUseFastGeneration,
          remainingFastGenerations:
            updatedFastGenStatus.remainingFastGenerations,
          weeklyLimit: updatedFastGenStatus.weeklyLimit,
          isPro: updatedFastGenStatus.isPro,
          credits: currentUser?.credits || 0,
        },
        { status: 200 }
      );
    }

    console.log("Processing decision:", {
      shouldUseFastGeneration,
      isPro: fastGenStatus.isPro,
      canUse: fastGenStatus.canUse,
      willAddDelay: !shouldUseFastGeneration,
    });

    // Deduct credits for all users (both pro and non-pro)
    // Credits are always deducted regardless of fast generation usage
    const { db } = await import("@/lib/prisma");
    const { safeDbOperation } = await import("@/lib/db-utils");

    // Check if user has enough credits
    const user = await safeDbOperation(async () => {
      return await db.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user has enough credits
    if (user.credits < 1) {
      return NextResponse.json(
        {
          message: "Insufficient credits",
          currentCredits: user.credits,
          requestedAmount: 1,
        },
        { status: 400 }
      );
    }

    // Deduct 1 credit
    const updatedUser = await safeDbOperation(async () => {
      return await db.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: 1,
          },
        },
        select: {
          credits: true,
        },
      });
    });

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Failed to update credits" },
        { status: 500 }
      );
    }

    // Add delay for non-pro users if not using fast generation
    if (!shouldUseFastGeneration) {
      console.log("Adding delay for non-pro users...");
      const delayTime = 20000 + Math.random() * 5000; // 20-25 seconds
      console.log(`Delay time: ${delayTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayTime));
      console.log("Delay completed");
    }

    // Try multiple free APIs in order of preference
    let resultImage = null;

    // Option 1: Your custom Hugging Face space using Gradio client
    if (!resultImage) {
      try {
        console.log(
          "Trying your custom Hugging Face space with Gradio client..."
        );

        // Convert base64 to blob
        const imageBuffer = Buffer.from(base64Image, "base64");
        const imageBlob = new Blob([imageBuffer], { type: "image/png" });

        // Import and use Gradio client
        const { Client } = await import("@gradio/client");

        // Connect to your space
        const client = await Client.connect("koushik779/bg-remover");

        // Make prediction
        const result = await client.predict("/predict", {
          image: imageBlob,
        });

        console.log("Gradio client result:", result.data);

        // Extract the result image
        if (result.data && result.data[0]) {
          const resultData = result.data[0];

          // Handle Gradio FileData format
          if (resultData.url) {
            // Download the image from the URL
            const imageResponse = await axios.get(resultData.url, {
              responseType: "arraybuffer",
              timeout: 30000,
            });
            const resultBase64 = Buffer.from(imageResponse.data).toString(
              "base64"
            );
            resultImage = `data:image/png;base64,${resultBase64}`;
            console.log(
              "Used your custom Hugging Face space successfully with Gradio client"
            );
          } else if (
            typeof resultData === "string" &&
            resultData.startsWith("data:image")
          ) {
            // Handle base64 string format
            let resultBase64 = resultData.split(",")[1]; // Remove data:image/png;base64, prefix
            resultImage = `data:image/png;base64,${resultBase64}`;
            console.log(
              "Used your custom Hugging Face space successfully with Gradio client"
            );
          } else {
            throw new Error("Invalid response format from Gradio client");
          }
        } else {
          throw new Error("Invalid response format from Gradio client");
        }
      } catch (error) {
        console.log(
          "Your custom Hugging Face space with Gradio client failed, trying next option:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Option 2: Alternative Hugging Face model
    if (!resultImage) {
      try {
        console.log("Trying alternative Hugging Face model...");
        const response = await axios.post(
          "https://api-inference.huggingface.co/models/sil-ai/rembg",
          Buffer.from(base64Image, "base64"),
          {
            headers: {
              Authorization: process.env.HUGGINGFACE_API_KEY
                ? `Bearer ${process.env.HUGGINGFACE_API_KEY}`
                : undefined,
              "Content-Type": "image/png",
            },
            responseType: "arraybuffer",
            timeout: 30000,
          }
        );
        const resultBase64 = Buffer.from(response.data).toString("base64");
        resultImage = `data:image/png;base64,${resultBase64}`;
        console.log("Used alternative Hugging Face model");
      } catch (error) {
        console.log(
          "Alternative Hugging Face model failed, trying next option:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Option 3: Clipdrop API (if API key is available)
    if (!resultImage && process.env.CLIPDROP_API_KEY) {
      try {
        console.log("Trying Clipdrop API...");
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
        console.log("Used Clipdrop API");
      } catch (error) {
        console.log(
          "Clipdrop failed, trying next option:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Option 4: Remove.bg API (if API key is available)
    if (!resultImage && process.env.REMOVE_BG_API_KEY) {
      try {
        console.log("Trying Remove.bg API...");
        const response = await axios.post(
          "https://api.remove.bg/v1.0/removebg",
          {
            image_file_b64: base64Image,
            size: "full", // Higher quality
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
        console.log("Used Remove.bg API");
      } catch (error) {
        console.log(
          "Remove.bg failed, trying next option:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Option 5: Photoroom API (if API key is available)
    if (!resultImage && process.env.PHOTOROOM_API_KEY) {
      try {
        console.log("Trying Photoroom API...");
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
        console.log("Used Photoroom API");
      } catch (error) {
        console.log(
          "Photoroom failed:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Final fallback: Return original image with a simple message
    if (!resultImage) {
      console.log("All APIs failed, using fallback approach...");

      // For now, we'll return the original image as a fallback
      // In a production environment, you might want to implement a simple
      // client-side background removal or show a message to the user
      resultImage = `data:image/png;base64,${base64Image}`;

      // You could also throw an error here if you prefer to fail gracefully
      // throw new Error(
      //   "Background removal services are temporarily unavailable. Please try again later or contact support."
      // );
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

    // Record fast generation usage if applicable (only for non-pro users)
    // This happens AFTER successful completion of background removal
    if (shouldUseFastGeneration && !fastGenStatus.isPro) {
      await recordFastGenerationUsage(session.user.id);
    }

    // Get updated fast generation status for non-pro users
    let updatedFastGenStatus = fastGenStatus;
    if (!fastGenStatus.isPro) {
      // Re-fetch the fast generation status after recording usage
      const { canUseFastGeneration } = await import(
        "@/lib/fast-generation-utils"
      );
      updatedFastGenStatus = await canUseFastGeneration(session.user.id, false);
    }

    return NextResponse.json(
      {
        image: resultImage,
        fastGenerationUsed: shouldUseFastGeneration,
        remainingFastGenerations: updatedFastGenStatus.remainingFastGenerations,
        weeklyLimit: updatedFastGenStatus.weeklyLimit,
        isPro: updatedFastGenStatus.isPro,
        credits: updatedUser.credits,
      },
      { status: 200 }
    );
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
