"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useSaveProject } from "@/contexts/save-project-context";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Loader2, X } from "lucide-react";

interface SaveProjectDialogProps {
  onSave: (name: string, description: string) => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
}

export interface SaveProjectDialogRef {
  openDialog: () => void;
}

const SaveProjectDialog = forwardRef<
  SaveProjectDialogRef,
  SaveProjectDialogProps
>(({ onSave, isLoading }, ref) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { saveDialogRef } = useSaveProject();

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      await onSave(name.trim(), description.trim());
      handleClose();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setOpen(false);
  };

  // Expose methods to parent component and context
  useImperativeHandle(ref, () => ({
    openDialog: () => setOpen(true),
  }));

  // Also expose to context
  useImperativeHandle(saveDialogRef, () => ({
    openDialog: () => setOpen(true),
  }));

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+S (Windows/Linux) or Cmd+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault(); // Prevent browser's default save dialog

        // Only trigger if dialog is open and we have a name
        if (open && name.trim() && !isLoading) {
          handleSave();
        } else if (!open) {
          // If dialog is closed, open it
          setOpen(true);
        }
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, name, isLoading]); // Dependencies to ensure we have latest values

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        } else {
          setOpen(isOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader className="relative">
          <DialogTitle className="text-white">Save Project</DialogTitle>
          <p className="text-sm text-gray-400 mt-1">
            Press{" "}
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-700 border border-gray-600 rounded">
              Ctrl+S
            </kbd>{" "}
            or{" "}
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-700 border border-gray-600 rounded">
              ⌘+S
            </kbd>{" "}
            to save
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="absolute right-0 top-0 h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-white">
              Project Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="bg-gray-800 border-gray-600 text-white"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-white">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              className="bg-gray-800 border-gray-600 text-white"
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="btn-outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Project"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

SaveProjectDialog.displayName = "SaveProjectDialog";

export default SaveProjectDialog;
