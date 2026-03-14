import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { sanitizeName, uniqueFilename } from "@/lib/utils";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const guestName = formData.get("guestName");

    console.log("[upload] Received request", {
      guestName,
      guestNameType: typeof guestName,
      formDataKeys: [...formData.keys()],
    });

    if (!guestName || typeof guestName !== "string" || guestName.trim().length < 2) {
      console.log("[upload] Invalid name:", { guestName });
      return NextResponse.json(
        { error: `Invalid name: "${guestName}" (must be at least 2 characters)` },
        { status: 400 }
      );
    }

    const folder = sanitizeName(guestName);
    console.log("[upload] Sanitized name:", { original: guestName, folder });

    if (!folder) {
      return NextResponse.json(
        { error: `Name "${guestName}" could not be sanitized into a valid folder name` },
        { status: 400 }
      );
    }

    const files = formData.getAll("files") as File[];
    console.log("[upload] Files received:", files.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    })));

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files found in request. Make sure files are sent with field name 'files'." },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: `Too many files: ${files.length} (maximum is 10)` },
        { status: 400 }
      );
    }

    const results: { name: string; key: string }[] = [];
    const errors: string[] = [];

    for (const file of files) {
      console.log("[upload] Processing file:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      });

      if (!ALLOWED_TYPES.includes(file.type)) {
        const msg = `${file.name}: unsupported type "${file.type}" (allowed: ${ALLOWED_TYPES.join(", ")})`;
        console.log("[upload] Rejected:", msg);
        errors.push(msg);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        const msg = `${file.name}: ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 20MB limit`;
        console.log("[upload] Rejected:", msg);
        errors.push(msg);
        continue;
      }

      const key = `${folder}/${uniqueFilename(file.name)}`;
      console.log("[upload] Uploading to key:", key);

      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        await uploadFile(key, buffer, file.type);
        console.log("[upload] Success:", { name: file.name, key });
        results.push({ name: file.name, key });
      } catch (err) {
        const msg = `${file.name}: ${err instanceof Error ? err.message : "upload failed"}`;
        console.error("[upload] S3 upload failed:", { key, error: err });
        errors.push(msg);
      }
    }

    if (results.length === 0 && errors.length > 0) {
      console.error("[upload] All files failed:", errors);
      return NextResponse.json(
        { error: `All uploads failed: ${errors.join("; ")}` },
        { status: 400 }
      );
    }

    console.log("[upload] Complete:", {
      uploaded: results.length,
      failed: errors.length,
    });

    return NextResponse.json({
      uploaded: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json(
      {
        error: `Server error: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 }
    );
  }
}
