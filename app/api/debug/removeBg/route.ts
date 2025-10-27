import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth-server";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check environment variables
    const envCheck = {
      HUGGINGFACE_API_KEY: !!process.env.HUGGINGFACE_API_KEY,
      CLIPDROP_API_KEY: !!process.env.CLIPDROP_API_KEY,
      REMOVE_BG_API_KEY: !!process.env.REMOVE_BG_API_KEY,
      PHOTOROOM_API_KEY: !!process.env.PHOTOROOM_API_KEY,
    };

    // Check if any API keys are available
    const hasAnyApiKey = Object.values(envCheck).some(Boolean);

    // Test Gradio client import
    let gradioClientStatus = "not_available";
    try {
      await import("@gradio/client");
      gradioClientStatus = "available";
    } catch (error) {
      gradioClientStatus = `error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }

    // Test basic functionality
    const basicTests = {
      crypto: typeof crypto !== "undefined",
      Buffer: typeof Buffer !== "undefined",
      axios: true, // Already imported
    };

    return NextResponse.json({
      status: "ok",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      apiKeys: envCheck,
      hasAnyApiKey,
      gradioClient: gradioClientStatus,
      basicTests,
      recommendations: {
        needsApiKey: !hasAnyApiKey,
        gradioClientIssue: gradioClientStatus !== "available",
        suggestedActions: [
          !hasAnyApiKey
            ? "Add at least one API key (HUGGINGFACE_API_KEY, CLIPDROP_API_KEY, etc.)"
            : null,
          gradioClientStatus !== "available"
            ? "Check @gradio/client package installation"
            : null,
        ].filter(Boolean),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
