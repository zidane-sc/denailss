/**
 * Seed the gallery catalog from the scraped Instagram portfolio.
 *
 * Reads scrap-ig-denails/data.json (181 posts with per-post `analysis`),
 * uploads every post image to the Supabase `gallery-images` bucket, and
 * inserts one `gallery` row + ordered `gallery_images` rows per post.
 *
 * Idempotent: storage uploads use upsert, gallery rows use ON CONFLICT by
 * slug (stable per post), and gallery_images are reconciled per gallery id.
 *
 * Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * DATABASE_URL.
 *
 * Usage:
 *   npx tsx scripts/seed-gallery.ts [--dry-run] [--limit N] [--reset]
 *
 * --reset deletes previously seeded gallery rows (legacy `des-*` from the old
 * seed.sql plus any `ig-*` from earlier runs) before seeding.
 */

import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import "dotenv/config";
import { readFile, stat } from "node:fs/promises";
import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, "../scrap-ig-denails/data.json");
const IMAGES_ROOT = path.resolve(__dirname, "../scrap-ig-denails/images");

const STYLE_LABELS: Record<string, string> = {
  minimalist: "Minimalis",
  korean: "Korean",
  french: "French",
  chrome: "Chrome",
  ombre: "Ombre",
  "3d-art": "3D Art",
};
const COLOR_LABELS: Record<string, string> = {
  nude: "Nude",
  pink: "Pink",
  red: "Merah",
  white: "Putih",
  black: "Hitam",
  pastel: "Pastel",
  gold: "Gold",
};
const OCCASION_LABELS: Record<string, string> = {
  daily: "Harian",
  wedding: "Wedding",
  party: "Party",
  festive: "Festive",
  graduation: "Wisuda",
};
const SHAPE_LABELS: Record<string, string> = {
  almond: "Almond",
  square: "Square",
  coffin: "Coffin",
  round: "Round",
  stiletto: "Stiletto",
};
const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Mudah",
  medium: "Sedang",
  complex: "Rumit",
  "very-complex": "Sangat Rumit",
};
const DIFFICULTY_PRICE: Record<string, number> = {
  easy: 150000,
  medium: 150000,
  complex: 170000,
  "very-complex": 170000,
};

const BUCKET = "gallery-images";
const STORAGE_PREFIX = "instagram";

interface ScrapImage {
  index: number;
  filename: string;
  path: string;
  alt_text: string | null;
}
interface ScrapPost {
  id: string;
  shortcode: string;
  url: string;
  username: string;
  uploaded_at: string;
  caption: string | null;
  media_type: string;
  images: ScrapImage[];
  analysis: {
    style: string;
    warna: string;
    acara: string;
    bentuk: string;
    difficulty: string;
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function aspectFromDimensions(width: number, height: number) {
  if (width > height * 1.1) return "landscape";
  if (height > width * 1.1) return "portrait";
  if (height > width * 1.02) return "tall";
  return "square";
}

function buildTitle(post: ScrapPost, index: number) {
  const a = post.analysis;
  const style = STYLE_LABELS[a.style] ?? a.style;
  const color = COLOR_LABELS[a.warna] ?? a.warna;
  const occasion = OCCASION_LABELS[a.acara] ?? a.acara;
  return `${style} ${color} ${occasion} #${index}`;
}

function buildDescription(post: ScrapPost): string {
  const a = post.analysis;
  const difficulty = DIFFICULTY_LABELS[a.difficulty] ?? a.difficulty;
  if (post.caption) {
    // Keep the first sentence-ish portion for the description.
    const cleaned = post.caption
      .replace(/#\w+/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned) return cleaned.slice(0, 200);
  }
  return `Desain ${STYLE_LABELS[a.style] ?? a.style} warna ${
    COLOR_LABELS[a.warna] ?? a.warna
  }, cocok untuk ${OCCASION_LABELS[a.acara] ?? a.acara}. Bentuk ${
    SHAPE_LABELS[a.bentuk] ?? a.bentuk
  } dengan tingkat kesulitan ${difficulty}.`;
}

async function getImageDimensions(filePath: string): Promise<{ width: number; height: number }> {
  const buf = await readFile(filePath);
  // JPEG SOF marker scan (covers the 1080px JPEGs in the dataset).
  let i = 2;
  while (i < buf.length - 10) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return { width: 1080, height: 1080 };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.DATABASE_URL;
  if (!url) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env");
    process.exit(1);
  }
  if (dryRun) {
    const data = JSON.parse(await readFile(DATA_PATH, "utf8")) as ScrapPost[];
    console.log(`Loaded ${data.length} posts from ${DATA_PATH}`);
    for (let i = 0; i < Math.min(data.length, limit); i++) {
      const post = data[i];
      const a = post.analysis;
      const slug = `${slugify(a.style)}-${slugify(a.warna)}-${slugify(a.acara)}-${post.shortcode.toLowerCase()}`;
      const title = buildTitle(post, i + 1);
      const price = DIFFICULTY_PRICE[a.difficulty] ?? 190000;
      const imageFiles = post.images.filter((img) => {
        try {
          statSync(path.resolve(IMAGES_ROOT, img.path.replace(/^images\//, "")));
          return true;
        } catch {
          return false;
        }
      });
      console.log(
        `[dry-run] ${slug} (${title}, ${price.toLocaleString("id-ID")}) — ${imageFiles.length}/${post.images.length} image(s) → ${BUCKET}/${STORAGE_PREFIX}/${post.shortcode}/`
      );
    }
    return;
  }
  if (!serviceKey) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env (required for uploads)");
    process.exit(1);
  }
  if (!dbUrl) {
    console.error("Missing DATABASE_URL in .env");
    process.exit(1);
  }

  const data = JSON.parse(await readFile(DATA_PATH, "utf8")) as ScrapPost[];
  console.log(`Loaded ${data.length} posts from ${DATA_PATH}`);

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const sql = postgres(dbUrl, { prepare: false });

  // Ensure bucket exists (idempotent).
  const { error: bucketErr } = await supabase.storage.getBucket(BUCKET);
  if (bucketErr) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (createErr) {
      console.error(`Failed to ensure bucket ${BUCKET}:`, createErr.message);
      await sql.end();
      process.exit(1);
    }
  }

  // --reset: remove previously seeded gallery rows (legacy `des-*` designs from
  // the old seed.sql and any `ig-*` rows from earlier runs) so the gallery
  // starts from a clean slate. Their gallery_images cascade via FK.
  if (args.includes("--reset")) {
    const removed = await sql`
      DELETE FROM public.gallery
      WHERE id LIKE 'des-%' OR id LIKE 'ig-%'
      RETURNING id
    `;
    console.log(`[reset] removed ${removed.length} previously seeded gallery row(s)`);
  }

  let uploaded = 0;
  let inserted = 0;

  for (let i = 0; i < data.length; i++) {
    const post = data[i];
    if (i >= limit) break;
    const a = post.analysis;
    const slug = `${slugify(a.style)}-${slugify(a.warna)}-${slugify(a.acara)}-${post.shortcode.toLowerCase()}`;
    const title = buildTitle(post, i + 1);
    const description = buildDescription(post);
    const price = DIFFICULTY_PRICE[a.difficulty] ?? 190000;

    // Resolve real image files from the scrap folder.
    const imageFiles: { storagePath: string; sortOrder: number; absPath: string }[] = [];
    for (const img of post.images) {
      const absPath = path.resolve(IMAGES_ROOT, img.path.replace(/^images\//, ""));
      try {
        await stat(absPath);
      } catch {
        console.warn(`  [warn] missing image file: ${img.path}`);
        continue;
      }
      const ext = path.extname(img.filename) || ".jpg";
      const storagePath = `${STORAGE_PREFIX}/${post.shortcode}/${String(img.index).padStart(2, "0")}${ext}`;
      imageFiles.push({ storagePath, sortOrder: img.index - 1, absPath });
    }

    if (imageFiles.length === 0) {
      console.warn(`  [skip] ${post.shortcode}: no image files`);
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${slug} (${title}) — ${imageFiles.length} image(s) to ${BUCKET}/${STORAGE_PREFIX}/${post.shortcode}/`);
      continue;
    }

    // Upload each image (upsert for idempotency).
    const storageRefs: string[] = [];
    for (const img of imageFiles) {
      const fileBytes = await readFile(img.absPath);
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(img.storagePath, fileBytes, { contentType: "image/jpeg", upsert: true });
      if (upErr) {
        console.error(`  [upload error] ${post.shortcode} ${img.storagePath}: ${upErr.message}`);
        continue;
      }
      storageRefs.push(`storage:${BUCKET}/${img.storagePath}`);
      uploaded++;
    }
    if (storageRefs.length === 0) continue;

    // Cover dimensions → aspect.
    const { width, height } = await getImageDimensions(imageFiles[0].absPath);
    const aspect = aspectFromDimensions(width, height);

    const galleryRow = {
      id: `ig-${post.shortcode}`,
      slug,
      title,
      description,
      aspect,
      style: a.style,
      color: a.warna,
      occasion: a.acara,
      shape: a.bentuk,
      difficulty: a.difficulty,
      price,
      updated_at: new Date(),
    };

    // Upsert gallery row, then reconcile gallery_images.
    try {
      await sql`
        INSERT INTO public.gallery (id, slug, title, description, aspect, style, color, occasion, shape, difficulty, price, created_at, updated_at)
        VALUES (${galleryRow.id}, ${galleryRow.slug}, ${galleryRow.title}, ${galleryRow.description}, ${galleryRow.aspect},
                ${galleryRow.style}, ${galleryRow.color}, ${galleryRow.occasion}, ${galleryRow.shape}, ${galleryRow.difficulty},
                ${galleryRow.price}, now(), now())
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug, title = EXCLUDED.title, description = EXCLUDED.description,
          aspect = EXCLUDED.aspect, style = EXCLUDED.style, color = EXCLUDED.color,
          occasion = EXCLUDED.occasion, shape = EXCLUDED.shape, difficulty = EXCLUDED.difficulty,
          price = EXCLUDED.price, updated_at = now()
      `;
      await sql`
        DELETE FROM public.gallery_images WHERE gallery_id = ${galleryRow.id}
      `;
      for (const [order, ref] of storageRefs.entries()) {
        await sql`
          INSERT INTO public.gallery_images (gallery_id, storage_path, sort_order, created_at, updated_at)
          VALUES (${galleryRow.id}, ${ref}, ${order}, now(), now())
        `;
      }
      inserted++;
      console.log(`  [ok] ${post.shortcode} → ${slug} (${storageRefs.length} images)`);
    } catch (err) {
      console.error(`  [db error] ${post.shortcode}:`, err instanceof Error ? err.message : err);
    }
  }

  await sql.end();
  console.log("\n=== Summary ===");
  console.log(`Posts processed: ${Math.min(data.length, limit)}`);
  console.log(`Images uploaded (incl. upserts): ${uploaded}`);
  console.log(`Gallery rows inserted/updated: ${inserted}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
