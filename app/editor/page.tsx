import RemoveBackground from "@/components/remove-background";
import AuthGuard from "@/components/auth-guard";
import { ServerAuthGuard } from "@/lib/server-auth";

export default function Home() {
  return (
    <ServerAuthGuard>
      <AuthGuard>
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow relative">
            {/* <ImageUploader onImageUpload={setBackgroundImage} /> */}

            <RemoveBackground />
          </main>
        </div>
      </AuthGuard>
    </ServerAuthGuard>
  );
}
