import ThumbnailGenerator from "@/components/thumbnail-generator";
import AuthGuard from "@/components/auth-guard";
import { ServerAuthGuard } from "@/lib/server-auth";

export default function ThumbnailGeneratorPage() {
  return (
    <ServerAuthGuard>
      <AuthGuard>
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow relative">
            <ThumbnailGenerator />
          </main>
        </div>
      </AuthGuard>
    </ServerAuthGuard>
  );
}
