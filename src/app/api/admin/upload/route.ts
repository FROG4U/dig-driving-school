import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

// Banner images render large, so allow generous originals but compress hard.
const MAX_WIDTH = 2000;
const WEBP_QUALITY = 82; // high quality, big size reduction
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB raw upload cap
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function requireAdmin(user: Awaited<ReturnType<typeof getAdminUser>>) {
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return null;
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  const err = requireAdmin(user);
  if (err) return err;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported type ${file.type}. Use JPG, PNG, WebP or AVIF.` }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 15MB)." }, { status: 400 });
  }

  const originalSize = file.size;
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // Compress: cap dimensions, strip metadata, re-encode as high-quality WebP.
  let outputBuffer: Buffer;
  let width: number | undefined;
  let height: number | undefined;
  try {
    const pipeline = sharp(inputBuffer, { failOn: "none" })
      .rotate() // honour EXIF orientation before stripping metadata
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY });
    outputBuffer = await pipeline.toBuffer();
    const meta = await sharp(outputBuffer).metadata();
    width = meta.width;
    height = meta.height;
  } catch {
    return NextResponse.json({ error: "Could not process image - it may be corrupt." }, { status: 400 });
  }

  // Save under /public/uploads with a collision-safe name.
  const rand = Math.random().toString(36).slice(2, 10);
  const filename = `${Date.now().toString(36)}-${rand}.webp`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), outputBuffer);
  } catch {
    return NextResponse.json({ error: "Could not save file to server." }, { status: 500 });
  }

  const url = `/uploads/${filename}`;
  const sizeBytes = outputBuffer.length;

  try {
    await prisma.mediaAsset.create({
      data: { url, filename, mimeType: "image/webp", width, height, sizeBytes, originalSize },
    });
  } catch {
    // Asset is on disk and usable even if the catalogue insert fails - don't block.
  }

  return NextResponse.json({
    url,
    width,
    height,
    sizeBytes,
    originalSize,
    saved: Math.max(0, originalSize - sizeBytes),
    savedPct: originalSize > 0 ? Math.round((1 - sizeBytes / originalSize) * 100) : 0,
  });
}
