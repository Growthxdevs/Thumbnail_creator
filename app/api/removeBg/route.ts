// import { NextResponse } from "next/server";
// import axios from "axios";

// export async function POST(req: Request) {
//   const { imageUrl } = await req.json();

//   if (!imageUrl) {
//     return NextResponse.json({ message: "Image is required" }, { status: 400 });
//   }

//   try {
//     const response = await axios.post(
//       "https://api.remove.bg/v1.0/removebg",
//       {
//         image_file_b64: imageUrl, // Base64 image string
//         size: "auto",
//       },
//       {
//         headers: {
//           "X-Api-Key": process.env.REMOVE_BG_API_KEY || "",
//         },
//         responseType: "arraybuffer", // Receive binary data
//       }
//     );

//     const base64Image = Buffer.from(response.data).toString("base64");
//     const resultImage = `data:image/png;base64,${base64Image}`;

//     return NextResponse.json({ image: resultImage }, { status: 200 });
//   } catch (error: any) {
//     console.error("Error removing background:", error.response?.data || error);
//     return NextResponse.json(
//       {
//         message: "Error removing background",
//         error: error.response?.data || error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { Client } from "@gradio/client";
import { getServerAuthSession } from "@/lib/auth-server";
import axios from "axios";

export async function POST(req: Request) {
  // Require authentication
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData(); // Correct way to handle file uploads
  const imageFile = formData.get("image");

  if (!imageFile) {
    return NextResponse.json({ message: "Image is required" }, { status: 400 });
  }

  try {
    console.log("Connecting to Gradio client...");
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Gradio client connection timeout")), 30000); // 30 second timeout
    });
    
    const clientPromise = Client.connect("koushik779/bg-remover");
    const client = await Promise.race([clientPromise, timeoutPromise]);
    
    console.log("Connected to Gradio client, making prediction...");
    
    // Add timeout for prediction as well
    const predictionTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Gradio prediction timeout")), 60000); // 60 second timeout for prediction
    });
    
    const predictionPromise = client.predict("/predict", {
      image: imageFile,
    });
    
    const response = await Promise.race([predictionPromise, predictionTimeoutPromise]);
    
    console.log("Prediction response:", JSON.stringify(response, null, 2));
    
    // Handle different response formats
    let imageUrl;
    if (response.data && response.data[0]) {
      if (typeof response.data[0] === 'string') {
        imageUrl = response.data[0];
      } else if (response.data[0].url) {
        imageUrl = response.data[0].url;
      } else {
        throw new Error("Unexpected response format from Gradio API");
      }
    } else {
      throw new Error("No image data returned from Gradio API");
    }
    
    console.log("Image URL:", imageUrl);
    return NextResponse.json({ image: imageUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Gradio client failed, trying fallback method:", error.message);
    
    // Fallback: Try direct HTTP request to Hugging Face Space
    try {
      console.log("Attempting fallback HTTP request...");
      
      // Convert File to base64 for the fallback
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = imageFile.type || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      const fallbackResponse = await axios.post(
        "https://koushik779-bg-remover.hf.space/api/predict",
        {
          data: [dataUrl]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 second timeout
        }
      );
      
      console.log("Fallback response:", JSON.stringify(fallbackResponse.data, null, 2));
      
      if (fallbackResponse.data && fallbackResponse.data.data && fallbackResponse.data.data[0]) {
        const fallbackImageUrl = fallbackResponse.data.data[0];
        console.log("Fallback image URL:", fallbackImageUrl);
        return NextResponse.json({ image: fallbackImageUrl }, { status: 200 });
      } else {
        throw new Error("No image data in fallback response");
      }
    } catch (fallbackError: any) {
      console.error("Fallback method also failed:", fallbackError);
      console.error("Original error:", error);
      console.error("Fallback error details:", {
        message: fallbackError.message,
        stack: fallbackError.stack,
        response: fallbackError.response?.data
      });
      
      return NextResponse.json(
        { 
          message: "Background removal failed - both primary and fallback methods failed", 
          error: error.message,
          fallbackError: fallbackError.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  }
}
