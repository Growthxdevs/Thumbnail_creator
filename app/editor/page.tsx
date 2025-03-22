"use client";
import RemoveBackground from "@/components/remove-background";
import { useState } from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow relative">
        {/* <ImageUploader onImageUpload={setBackgroundImage} /> */}

        <RemoveBackground />
      </main>
    </div>
  );
}
