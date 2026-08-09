/**
 * Instagram post management — mock-first seam standing in for the future
 * `instagram_posts` repository. The owner pastes an embed link / embed code,
 * the shortcode is parsed out, and the landing Instagram grid renders from
 * this list (via `getLiveInstagramPosts`). Swap for a real API later without
 * touching components.
 *
 * State persists to localStorage (`denailss.instagram.posts`); the seed
 * shortcodes below are the fallback until the first edit.
 */

const STORAGE_KEY = "denailss.instagram.posts";

export const INSTAGRAM_POST_SEED = [
  "Dbu1XBck4up",
  "Dbu1FShk7lj",
  "Dbpbb8EE_hT",
  "DbpbQa0k0lz",
  "DbD0iUDE5mm",
  "DbAvYO6k4g5",
] as const;

export const INSTAGRAM_POST_URL = (shortcode: string) =>
  `https://www.instagram.com/p/${shortcode}/`;

/**
 * Extract an Instagram shortcode from a paste: works with full URLs
 * (https://www.instagram.com/p/AbC123xyz/), short urls (https://ig.me/...),
 * and raw embed code (`<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/AbC123xyz/?utm_source=ig_embed...">`).
 */
export function parseInstagramShortcode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Raw shortcode (6-20 chars of base64url-ish alphabet)
  if (/^[A-Za-z0-9_-]{6,20}$/.test(trimmed)) return trimmed;

  // permalink attribute inside embed code
  const permalinkMatch = trimmed.match(/data-instgrm-permalink="([^"]+)"/);
  const urlCandidate = permalinkMatch ? permalinkMatch[1] : trimmed;

  // Match the shortcode after /p/ (or /reel/ or /tv/), stopping at /, ?, or #
  const shortcodeMatch = urlCandidate.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]{6,20})/);
  if (shortcodeMatch) return shortcodeMatch[1];

  return null;
}

let cached: string[] | null = null;

function load(): string[] {
  if (cached) return cached;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) {
          cached = parsed;
          return cached;
        }
      }
    } catch {
      // fall through to seed
    }
  }
  cached = [...INSTAGRAM_POST_SEED];
  return cached;
}

/** SSR-safe reactive read: server gets the seed, client gets persisted + live. */
export function getLiveInstagramPosts(): string[] {
  if (typeof window !== "undefined") return load();
  return [...INSTAGRAM_POST_SEED];
}

/** Subscriber set for reactive (live) reads of the post list. */
const subscribers = new Set<() => void>();

export function subscribeInstagramPosts(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function notify() {
  subscribers.forEach((cb) => cb());
}

function save(list: string[]) {
  cached = list;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // storage unavailable (private mode etc.) — keep in-memory state
    }
  }
  notify();
}

export function addInstagramPost(shortcode: string): { list: string[]; added: boolean } {
  const list = load();
  if (list.includes(shortcode)) return { list, added: false };
  const next = [shortcode, ...list];
  save(next);
  return { list: next, added: true };
}

export function removeInstagramPost(shortcode: string): string[] {
  const next = load().filter((s) => s !== shortcode);
  save(next);
  return next;
}
