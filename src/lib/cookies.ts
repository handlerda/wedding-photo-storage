export function getGuestName(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )guest_name=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setGuestName(name: string): void {
  const encoded = encodeURIComponent(name.trim());
  document.cookie = `guest_name=${encoded}; path=/; max-age=31536000; SameSite=Lax`;
}

export function clearGuestName(): void {
  document.cookie = "guest_name=; path=/; max-age=0";
}
