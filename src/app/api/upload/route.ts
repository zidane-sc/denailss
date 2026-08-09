import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * FE-first image upload endpoint (Epic 5). Saves an uploaded image into
 * `public/images/uploads/` so the server-rendered gallery pages can serve it
 * directly. No real storage backend yet — this is the mock seam for the
 * future object-storage upload (TRD §4/§5).
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File harus berupa gambar." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const maxBytes = 6 * 1024 * 1024;
    if (bytes.byteLength > maxBytes) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 6 MB." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = /^[a-z0-9]{2,5}$/.test(ext) ? ext : "jpg";
    const filename = `upload-${Date.now()}-${Math.round(Math.random() * 1e6)}.${safeExt}`;

    const uploadDir = path.join(process.cwd(), "public", "images", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), bytes);

    return NextResponse.json({ url: `/images/uploads/${filename}` });
  } catch (error) {
    console.error("Upload gagal:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat mengunggah." }, { status: 500 });
  }
}
