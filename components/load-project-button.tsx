"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { FolderOpen } from "lucide-react";
import ProjectGallery from "./project-gallery";
import { Project } from "@/types/project";

interface LoadProjectButtonProps {
  onLoadProject: (project: Project) => void;
  disabled?: boolean;
}

export default function LoadProjectButton({
  onLoadProject,
  disabled,
}: LoadProjectButtonProps) {
  const [showGallery, setShowGallery] = useState(false);

  const handleLoadProject = (project: Project) => {
    onLoadProject(project);
    setShowGallery(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowGallery(true)}
        disabled={disabled}
        className="flex items-center gap-2 btn-outline-white"
      >
        <FolderOpen className="w-4 h-4" />
        Load Project
      </Button>

      {showGallery && (
        <ProjectGallery
          onLoadProject={handleLoadProject}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  );
}
