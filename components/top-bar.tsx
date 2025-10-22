"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import UserMenu from "./user-menu";
import LoginButton from "./login-button";
import { useSaveProject } from "@/contexts/save-project-context";
import { Save } from "lucide-react";
import { Button } from "./ui/button";

const TopBar = () => {
  const { data: session, status } = useSession();
  const { saveDialogRef, canSave } = useSaveProject();
  const pathname = usePathname();

  // Only show save button on editor page
  const isEditorPage = pathname === "/editor";

  const handleSaveClick = () => {
    if (saveDialogRef.current) {
      saveDialogRef.current.openDialog();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-dark-bg-secondary/80 border-b border-dark-border">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="mr-4">
          <Link
            href="/"
            className="text-2xl font-extrabold dark-glow-text font-dancing"
          >
            Thumbnail Creator
          </Link>
        </div>

        {/* Navigation Links - Editor button disabled */}
        {/* {session && (
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/editor"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isEditorPage
                  ? "bg-white/20 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Editor</span>
            </Link>
          </nav>
        )} */}

        <div className="flex items-center space-x-4">
          {/* {session && isEditorPage && (
            <Button
              onClick={handleSaveClick}
              variant="outline"
              size="sm"
              disabled={!canSave}
              className="btn-outline-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Project
            </Button>
          )} */}
          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse" />
          ) : session ? (
            <UserMenu />
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
