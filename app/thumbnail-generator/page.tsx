import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ThumbnailGeneratorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            AI Thumbnail Generator
          </h1>
          <h2 className="text-xl font-semibold text-gray-300 mb-4">
            Temporarily Disabled
          </h2>
          <p className="text-gray-400 mb-8">
            The AI Thumbnail Generator is currently under maintenance and will
            be back soon. Thank you for your patience.
          </p>
        </div>

        <Button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
