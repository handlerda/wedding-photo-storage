export function sanitizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

export function uniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 6);
  return `${timestamp}-${random}-${originalName}`;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${file.name} is not a supported image type`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} is too large (max 20MB)`;
  }
  return null;
}
