/**
 * Postingan Instagram Denailss yang ditampilkan di section landing.
 *
 * Source: "Copy embed code" dari post @denailss_9 di Instagram.
 * Untuk menambah/mengganti post: buka post di instagram.com → ⋯ → Embed →
 * Copy embed code, lalu ganti nilai `permalink` di bawah dengan shortcode post baru.
 */
export const INSTAGRAM_POSTS = [
  "Dbu1XBck4up",
  "Dbu1FShk7lj",
  "Dbpbb8EE_hT",
  "DbpbQa0k0lz",
  "DbD0iUDE5mm",
  "DbAvYO6k4g5",
] as const;

export const INSTAGRAM_POST_URL = (shortcode: string) =>
  `https://www.instagram.com/p/${shortcode}/`;
