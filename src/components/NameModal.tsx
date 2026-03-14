"use client";

import { useState } from "react";

interface NameModalProps {
  onSubmit: (name: string) => void;
  initialName?: string;
}

export default function NameModal({ onSubmit, initialName = "" }: NameModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter your name (at least 2 characters)");
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-light tracking-[3px] uppercase text-pink-accent mb-2">
          Share Your Photos
        </h1>
        <p className="text-sm tracking-[2px] uppercase text-gray-500 mb-10">
          Colette & Davis &middot; June 13, 2026
        </p>

        <div className="mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Your Name"
            autoFocus
            className="w-full border-b-2 border-pink-accent bg-transparent py-3 text-center text-lg tracking-wide outline-none placeholder:text-gray-300 focus:border-pink-hover"
          />
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-pink-accent py-4 text-sm font-semibold tracking-[2px] uppercase text-white transition-colors active:bg-pink-hover"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
