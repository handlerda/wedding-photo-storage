"use client";

interface HeaderProps {
  guestName: string;
  onChangeName: () => void;
}

export default function Header({ guestName, onChangeName }: HeaderProps) {
  return (
    <header className="w-full border-b border-pink-accent/20 px-6 py-4">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        <h1 className="text-xs font-light tracking-[3px] uppercase text-pink-accent">
          Colette & Davis
        </h1>
        <div className="flex items-center gap-2 text-xs tracking-wide text-gray-500">
          <span>Hi, {guestName}</span>
          <button
            onClick={onChangeName}
            className="text-pink-accent underline underline-offset-2"
          >
            change
          </button>
        </div>
      </div>
    </header>
  );
}
