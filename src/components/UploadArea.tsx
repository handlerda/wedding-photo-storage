"use client";

import { useRef, useState } from "react";
import { validateFile } from "@/lib/utils";

interface UploadAreaProps {
  guestName: string;
  onUploadComplete: (count: number) => void;
}

export default function UploadArea({ guestName, onUploadComplete }: UploadAreaProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError("");

    // Validate files client-side
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const err = validateFile(files[i]);
      if (err) {
        setError(err);
        return;
      }
      validFiles.push(files[i]);
    }

    if (validFiles.length > 10) {
      setError("Maximum 10 photos at a time");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("guestName", guestName);
      validFiles.forEach((file) => formData.append("files", file));

      console.log("[client] Uploading", {
        guestName,
        files: validFiles.map((f) => ({ name: f.name, type: f.type, size: f.size })),
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      console.log("[client] Response:", res.status, text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError(`Server returned invalid response (${res.status}): ${text.slice(0, 200)}`);
        return;
      }

      if (!res.ok) {
        setError(data.error || `Upload failed with status ${res.status}`);
        return;
      }

      if (data.errors?.length) {
        console.warn("[client] Partial failures:", data.errors);
      }

      onUploadComplete(data.uploaded.length);
    } catch (err) {
      console.error("[client] Upload error:", err);
      setError(`Upload failed: ${err instanceof Error ? err.message : "Check your connection and try again."}`);
    } finally {
      setIsUploading(false);
      // Reset inputs so the same file can be re-selected
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (libraryInputRef.current) libraryInputRef.current.value = "";
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-pink-accent border-t-transparent" />
          <p className="mt-4 text-sm tracking-wide text-gray-500">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full min-h-[56px] rounded-xl bg-pink-accent px-6 py-4 text-base font-semibold tracking-[1.5px] uppercase text-white transition-colors active:bg-pink-hover"
          >
            Take a Photo
          </button>

          <button
            onClick={() => libraryInputRef.current?.click()}
            className="w-full min-h-[56px] rounded-xl border-2 border-pink-accent px-6 py-4 text-base font-semibold tracking-[1.5px] uppercase text-pink-accent transition-colors active:bg-pink-light"
          >
            Choose from Library
          </button>

          <p className="text-center text-xs text-gray-400 mt-2">
            JPG, PNG, or WebP &middot; Up to 20MB each &middot; 10 photos max
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
