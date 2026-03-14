"use client";

import { useState, useEffect } from "react";
import { getGuestName, setGuestName } from "@/lib/cookies";
import NameModal from "@/components/NameModal";
import Header from "@/components/Header";
import UploadArea from "@/components/UploadArea";
import UploadSuccess from "@/components/UploadSuccess";

type View = "upload" | "success";

export default function Home() {
  const [name, setName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [view, setView] = useState<View>("upload");
  const [uploadedCount, setUploadedCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = getGuestName();
    if (saved) {
      setName(saved);
    } else {
      setShowNameModal(true);
    }
    setMounted(true);
  }, []);

  function handleNameSubmit(newName: string) {
    setGuestName(newName);
    setName(newName);
    setShowNameModal(false);
  }

  function handleChangeName() {
    setShowNameModal(true);
  }

  function handleUploadComplete(count: number) {
    setUploadedCount(count);
    setView("success");
  }

  function handleUploadMore() {
    setView("upload");
  }

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {showNameModal && (
        <NameModal
          onSubmit={handleNameSubmit}
          initialName={name || ""}
        />
      )}

      {name && !showNameModal && (
        <>
          <Header guestName={name} onChangeName={handleChangeName} />

          <main className="flex flex-1 flex-col items-center justify-center py-12">
            {view === "upload" && (
              <>
                <div className="mb-10 text-center px-6">
                  <h2 className="text-2xl font-light tracking-[3px] uppercase text-gray-800 mb-2">
                    Share Your Photos
                  </h2>
                  <p className="text-sm text-gray-400">
                    Capture the moment or choose from your library
                  </p>
                </div>
                <UploadArea
                  guestName={name}
                  onUploadComplete={handleUploadComplete}
                />
              </>
            )}

            {view === "success" && (
              <UploadSuccess
                count={uploadedCount}
                onUploadMore={handleUploadMore}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}
