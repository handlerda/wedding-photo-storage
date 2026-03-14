"use client";

interface UploadSuccessProps {
  count: number;
  onUploadMore: () => void;
}

export default function UploadSuccess({ count, onUploadMore }: UploadSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-pink-accent/10">
        <svg
          className="h-10 w-10 text-pink-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h2 className="text-xl font-light tracking-[2px] uppercase text-gray-800 mb-2">
        Thank You!
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        {count} photo{count !== 1 ? "s" : ""} uploaded successfully
      </p>

      <button
        onClick={onUploadMore}
        className="w-full max-w-xs min-h-[56px] rounded-xl bg-pink-accent px-6 py-4 text-base font-semibold tracking-[1.5px] uppercase text-white transition-colors active:bg-pink-hover"
      >
        Upload More Photos
      </button>
    </div>
  );
}
