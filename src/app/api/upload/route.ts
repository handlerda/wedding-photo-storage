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

    const results: { name: string; key: string }[] = [];
    const errors: string[] = [];

    // Process files in parallel batches of 5
    const BATCH_SIZE = 5;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(async (file) => {
          console.log("[upload] Processing file:", {
            name: file.name,
            type: file.type,
            size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          });

          if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error(`unsupported type "${file.type}" (allowed: ${ALLOWED_TYPES.join(", ")})`);
          }

          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 20MB limit`);
          }

          const key = `${folder}/${uniqueFilename(file.name)}`;
          console.log("[upload] Uploading to key:", key);

          const buffer = Buffer.from(await file.arrayBuffer());
          await uploadFile(key, buffer, file.type);

          console.log("[upload] Success:", { name: file.name, key });
          return { name: file.name, key };
        })
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          const fileName = batch[j].name;
          const msg = `${fileName}: ${result.reason instanceof Error ? result.reason.message : "upload failed"}`;
          console.error("[upload] Failed:", msg);
          errors.push(msg);
        }
      }

      console.log(`[upload] Batch ${Math.floor(i / BATCH_SIZE) + 1} complete: ${Math.min(i + BATCH_SIZE, files.length)}/${files.length} processed`);
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
