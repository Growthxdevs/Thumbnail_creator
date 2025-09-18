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
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Client } from "@gradio/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData(); // Correct way to handle file uploads
  const imageFile = formData.get("image");

  if (!imageFile) {
    return NextResponse.json({ message: "Image is required" }, { status: 400 });
  }

  try {
    const client = await Client.connect("koushik779/bg-remover");
    const response = await client.predict("/predict", {
      image: imageFile,
    });
    // const response = await axios.post(
    //   "https://koushik779-bg-remover.hf.space",
    //   { inputs: imageFile },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    //     },
    //     responseType: "arraybuffer",
    //   }
    // );

    // const base64Image = Buffer.from(response.data).toString("base64");
    // const resultImage = `data:image/png;base64,${base64Image}`;

    //@ts-ignore
    return NextResponse.json({ image: response.data[0].url }, { status: 200 });
  } catch (error: any) {
    console.error("Error removing background:", error.response?.data || error);
    return NextResponse.json(
      { message: "Background removal failed", error: error.message },
      { status: 500 }
    );
  }
}
