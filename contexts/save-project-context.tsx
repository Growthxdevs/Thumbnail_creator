"use client";

import React, {
  createContext,
  useContext,
  useRef,
  ReactNode,
  useState,
} from "react";
import { SaveProjectDialogRef } from "@/components/save-project-dialog";

interface SaveProjectContextType {
  saveDialogRef: React.RefObject<SaveProjectDialogRef>;
  canSave: boolean;
  setCanSave: (canSave: boolean) => void;
}

const SaveProjectContext = createContext<SaveProjectContextType | undefined>(
  undefined
);

export const useSaveProject = () => {
  const context = useContext(SaveProjectContext);
  if (!context) {
    throw new Error("useSaveProject must be used within a SaveProjectProvider");
  }
  return context;
};

interface SaveProjectProviderProps {
  children: ReactNode;
}

export const SaveProjectProvider: React.FC<SaveProjectProviderProps> = ({
  children,
}) => {
  const saveDialogRef = useRef<SaveProjectDialogRef>(null);
  const [canSave, setCanSave] = useState(false);

  return (
    <SaveProjectContext.Provider value={{ saveDialogRef, canSave, setCanSave }}>
      {children}
    </SaveProjectContext.Provider>
  );
};
