"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import UserMenu from "./user-menu";
import LoginButton from "./login-button";
import { useSaveProject } from "@/contexts/save-project-context";
import { Save } from "lucide-react";
import { Button } from "./ui/button";

const TopBar = () => {
  const { data: session, status } = useSession();
  const { saveDialogRef, canSave } = useSaveProject();

  const handleSaveClick = () => {
    if (saveDialogRef.current) {
      saveDialogRef.current.openDialog();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/30">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="mr-4">
          <Link
            href="/"
            className="text-2xl font-extrabold text-white font-dancing"
          >
            Thumbnail Creator
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {session && (
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
          )}
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
