// Supabase Edge Function for Background Removal using Hugging Face API
// This function runs 24/7 for FREE on Supabase Edge Functions

// @ts-expect-error - Deno std library types are available at runtime in Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/// <reference path="./deno.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return new Response(JSON.stringify({ error: "Image is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert base64 image to blob
    let imageBlob: Blob;
    if (image.startsWith("data:image")) {
      // Extract base64 string from data URI
      const base64Data = image.split(",")[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBlob = new Blob([bytes], { type: "image/png" });
    } else {
      // Assume it's already base64 without data URI prefix
      const binaryString = atob(image);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBlob = new Blob([bytes], { type: "image/png" });
    }

    console.log("Processing image with background removal API...");

    // Get API keys from environment
    const removeBgApiKey = Deno.env.get("REMOVE_BG_API_KEY");
    const clipdropApiKey = Deno.env.get("CLIPDROP_API_KEY");
    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
    const hfApiKey = Deno.env.get("HUGGINGFACE_API_KEY");

    const hfSpaceName =
      Deno.env.get("HUGGINGFACE_SPACE_NAME") || "GrowthXDev/rembg2";
    console.log("API Keys available:", {
      removeBg: removeBgApiKey ? "Set" : "Not set",
      clipdrop: clipdropApiKey ? "Set" : "Not set",
      replicate: replicateApiKey ? "Set" : "Not set",
      huggingface: hfApiKey ? "Set" : "Not set",
      hfGradioSpace: hfSpaceName,
    });

    const imageArrayBuffer = await imageBlob.arrayBuffer();
    console.log("Image size:", imageArrayBuffer.byteLength, "bytes");

    // Convert to base64 for APIs that need it
    const uint8Array = new Uint8Array(imageArrayBuffer);
    let base64Image = "";
    const CHUNK_SIZE = 8192;
    for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
      const chunk = uint8Array.slice(i, i + CHUNK_SIZE);
      base64Image += String.fromCharCode.apply(null, Array.from(chunk));
    }
    base64Image = btoa(base64Image);

    let apiResponse: Response | null = null;
    let lastError: Error | null = null;

    // Try Remove.bg API first (if available)
    if (removeBgApiKey) {
      try {
        console.log("Trying Remove.bg API...");
        apiResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: {
            "X-Api-Key": removeBgApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image_file_b64: base64Image,
            size: "full",
          }),
        });

        console.log("Remove.bg API response status:", apiResponse.status);

        if (apiResponse.ok) {
          console.log("Successfully using Remove.bg API");
          // Continue to process response below
        } else {
          const errorText = await apiResponse.text();
          console.error("Remove.bg API error:", errorText);
          lastError = new Error(
            `Remove.bg API error (${apiResponse.status}): ${errorText}`
          );
          apiResponse = null;
        }
      } catch (err) {
        console.error("Error calling Remove.bg API:", err);
        lastError = err instanceof Error ? err : new Error(String(err));
        apiResponse = null;
      }
    }

    // Try Hugging Face Gradio client as second option (custom space)
    if (!apiResponse) {
      try {
        console.log("Trying Hugging Face Gradio client...");

        // Import Gradio client using npm: specifier for Deno compatibility
        // @ts-expect-error - npm: imports work at runtime in Deno
        const { Client } = await import("npm:@gradio/client@1.19.1");

        // Connect to the Hugging Face Space
        // For private spaces, provide hf_token. For public spaces, it's optional.
        // Using the existing HUGGINGFACE_API_KEY if available (same token works for both API and Spaces)
        const connectOptions: { hf_token?: string } = {};
        if (hfApiKey) {
          connectOptions.hf_token = hfApiKey;
          console.log("Using Hugging Face token for private space access");
        } else {
          console.log(
            "Connecting to public Hugging Face Space (no token required)"
          );
        }

        const client = await Client.connect(hfSpaceName, connectOptions);

        console.log(`Connected to Hugging Face Space: ${hfSpaceName}`);

        // Make prediction
        const result = await client.predict("/predict", {
          image: imageBlob,
        });

        console.log("Gradio client prediction result received");

        // Extract the result image from Gradio response
        if (result.data && Array.isArray(result.data) && result.data[0]) {
          const resultData = result.data[0];

          // Handle Gradio FileData format (URL)
          if (resultData.url) {
            console.log("Downloading result image from URL:", resultData.url);
            apiResponse = await fetch(resultData.url);

            if (apiResponse.ok) {
              console.log(
                `Successfully using Hugging Face Gradio client with space: ${hfSpaceName}`
              );
              // apiResponse is set, will be processed below
            } else {
              throw new Error(
                `Failed to download image from Gradio URL: ${apiResponse.status}`
              );
            }
          }
          // Handle base64 string format
          else if (
            typeof resultData === "string" &&
            resultData.startsWith("data:image")
          ) {
            // Convert base64 data URI to blob for consistency
            const base64Data = resultData.split(",")[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const resultBlob = new Blob([bytes], { type: "image/png" });
            apiResponse = new Response(resultBlob, {
              headers: { "Content-Type": "image/png" },
            });
            console.log(
              `Successfully using Hugging Face Gradio client with space: ${hfSpaceName}`
            );
          } else {
            throw new Error("Invalid response format from Gradio client");
          }
        } else {
          throw new Error("No data in Gradio client response");
        }
      } catch (err) {
        console.error("Error calling Hugging Face Gradio client:", err);
        lastError = err instanceof Error ? err : new Error(String(err));
        apiResponse = null;
        // Continue to try Clipdrop API as fallback
      }
    }

    // Try Clipdrop API if Remove.bg and Gradio failed
    if (!apiResponse && clipdropApiKey) {
      try {
        console.log("Trying Clipdrop API...");
        apiResponse = await fetch(
          "https://clipdrop-api.co/remove-background/v1",
          {
            method: "POST",
            headers: {
              "x-api-key": clipdropApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image_file: base64Image,
            }),
          }
        );

        console.log("Clipdrop API response status:", apiResponse.status);

        if (apiResponse.ok) {
          console.log("Successfully using Clipdrop API");
          // Continue to process response below
        } else {
          const errorText = await apiResponse.text();
          console.error("Clipdrop API error:", errorText);
          lastError = new Error(
            `Clipdrop API error (${apiResponse.status}): ${errorText}`
          );
          apiResponse = null;
        }
      } catch (err) {
        console.error("Error calling Clipdrop API:", err);
        lastError = err instanceof Error ? err : new Error(String(err));
        apiResponse = null;
      }
    }

    // Try Replicate API (if available) - Works with BRIA models
    if (!apiResponse && replicateApiKey) {
      try {
        console.log("Trying Replicate API with BRIA model...");

        // Replicate API for BRIA RMBG-2.0
        const prediction = await fetch(
          "https://api.replicate.com/v1/predictions",
          {
            method: "POST",
            headers: {
              Authorization: `Token ${replicateApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              version: "fb8af171cfa1616ddcf1342fd5c5e761", // BRIA RMBG-2.0 model version
              input: {
                image: `data:image/png;base64,${base64Image}`,
              },
            }),
          }
        );

        if (!prediction.ok) {
          const errorText = await prediction.text();
          console.error("Replicate API error:", errorText);
          lastError = new Error(
            `Replicate API error (${prediction.status}): ${errorText}`
          );
        } else {
          const predictionData = await prediction.json();
          const predictionId = predictionData.id;
          console.log("Replicate prediction created:", predictionId);

          // Poll for result (Replicate is async)
          let resultReady = false;
          let attempts = 0;
          const maxAttempts = 60; // Max 60 seconds (1 second intervals)

          while (!resultReady && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            attempts++;

            const statusResponse = await fetch(
              `https://api.replicate.com/v1/predictions/${predictionId}`,
              {
                headers: {
                  Authorization: `Token ${replicateApiKey}`,
                },
              }
            );

            const statusData = await statusResponse.json();
            console.log(
              `Replicate status (attempt ${attempts}):`,
              statusData.status
            );

            if (statusData.status === "succeeded") {
              // Download the result image directly
              const resultUrl = statusData.output;
              apiResponse = await fetch(resultUrl);
              resultReady = true;
              console.log("Successfully using Replicate API");
              break;
            } else if (statusData.status === "failed") {
              throw new Error(
                `Replicate prediction failed: ${JSON.stringify(
                  statusData.error
                )}`
              );
            }
          }

          if (!resultReady) {
            throw new Error("Replicate API timeout - prediction took too long");
          }
        }
      } catch (err) {
        console.error("Error calling Replicate API:", err);
        lastError = err instanceof Error ? err : new Error(String(err));
        apiResponse = null;
      }
    }

    // Try Hugging Face API as last resort (if available)
    // Using u2net-image-rembg model which works with HF Inference API
    const hfModels = [
      "reidn3r/u2net-image-rembg", // u2net model for background removal
    ];

    if (!apiResponse && hfApiKey) {
      modelLoop: for (const model of hfModels) {
        const maxRetries = 3; // Retry up to 3 times for model loading

        for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
          try {
            console.log(
              `Trying Hugging Face API with model: ${model} (attempt ${
                retryCount + 1
              }/${maxRetries})...`
            );

            // Use multipart form-data for image upload (better compatibility)
            const formData = new FormData();
            const imageBlobForForm = new Blob([imageArrayBuffer], {
              type: "image/png",
            });
            formData.append("file", imageBlobForForm, "image.png");

            apiResponse = await fetch(
              `https://api-inference.huggingface.co/models/${model}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${hfApiKey}`,
                  // Don't set Content-Type - let browser set it with boundary for multipart
                },
                body: formData,
              }
            );

            console.log(
              `Hugging Face API response status for ${model}:`,
              apiResponse.status
            );

            // Handle 503 - Model is loading (common on free tier)
            if (apiResponse.status === 503) {
              const errorData = await apiResponse.json().catch(() => ({}));
              const waitTime = errorData.estimated_time
                ? errorData.estimated_time * 1000
                : 5000; // Default 5 seconds

              if (retryCount < maxRetries - 1) {
                console.log(
                  `Model ${model} is loading... waiting ${
                    waitTime / 1000
                  }s before retry ${retryCount + 2}/${maxRetries}`
                );
                await new Promise((resolve) => setTimeout(resolve, waitTime));
                apiResponse = null; // Reset for retry
                continue; // Retry the same model
              } else {
                console.error(
                  `Model ${model} is still loading after ${maxRetries} attempts. Trying next model...`
                );
                const errorText = JSON.stringify(errorData);
                lastError = new Error(
                  `Hugging Face model ${model} is loading (503): ${errorText.substring(
                    0,
                    100
                  )}`
                );
                apiResponse = null;
                continue modelLoop; // Try next model
              }
            } else if (apiResponse.ok) {
              console.log(`Successfully using Hugging Face API with ${model}`);
              break modelLoop; // Found a working model, exit both loops
            } else if (apiResponse.status === 404) {
              // Model not found or Inference API not available for this model
              console.error(
                `Model ${model} not found or Inference API not available (404). This model may not be accessible through the Inference API endpoint.`
              );
              lastError = new Error(
                `Model ${model} is not available through Hugging Face Inference API. The model may exist on HF but doesn't have an Inference API endpoint enabled.`
              );
              apiResponse = null;
              continue modelLoop; // Try next model
            } else {
              // Other error (not 503, not 404)
              const contentType = apiResponse.headers.get("content-type");
              let errorText = "";

              if (contentType && contentType.includes("application/json")) {
                const errorData = await apiResponse.json();
                errorText = JSON.stringify(errorData);
              } else {
                errorText = await apiResponse.text();
              }

              console.error(
                `Hugging Face API error for ${model} (${apiResponse.status}):`,
                errorText.substring(0, 200)
              );
              lastError = new Error(
                `Hugging Face API error (${
                  apiResponse.status
                }) for ${model}: ${errorText.substring(0, 100)}`
              );
              apiResponse = null;
              continue modelLoop; // Try next model
            }
          } catch (err) {
            console.error(`Error calling Hugging Face API with ${model}:`, err);
            lastError = err instanceof Error ? err : new Error(String(err));
            apiResponse = null;

            // Only retry on network errors, not on 4xx/5xx (except 503 handled above)
            if (retryCount < maxRetries - 1) {
              await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s before retry
              continue; // Retry the same model
            } else {
              continue modelLoop; // Try next model
            }
          }
        }
      }
    }

    if (!apiResponse || !apiResponse.ok) {
      const errorMsg = lastError
        ? `All background removal APIs failed. Last error: ${lastError.message}`
        : "All background removal APIs failed. Please configure at least one API key in Supabase secrets.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Check if response is an image or error JSON
    const contentType = apiResponse.headers.get("content-type");
    console.log("Response content type:", contentType);

    if (contentType && contentType.includes("application/json")) {
      // Likely an error message from API
      const errorData = await apiResponse.json();
      console.error("API error response:", errorData);
      throw new Error(`API error: ${JSON.stringify(errorData)}`);
    }

    // Convert result to base64
    const resultArrayBuffer = await apiResponse.arrayBuffer();
    console.log("Result size:", resultArrayBuffer.byteLength, "bytes");
    const resultUint8Array = new Uint8Array(resultArrayBuffer);

    // Handle large arrays by chunking (prevents call stack overflow)
    let base64String = "";
    for (let i = 0; i < resultUint8Array.length; i += CHUNK_SIZE) {
      const chunk = resultUint8Array.slice(i, i + CHUNK_SIZE);
      base64String += String.fromCharCode.apply(null, Array.from(chunk));
    }
    base64String = btoa(base64String);

    const resultImage = `data:image/png;base64,${base64String}`;

    console.log("Background removal completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        image: resultImage,
        message: "Background removed successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error removing background:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to remove background",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
