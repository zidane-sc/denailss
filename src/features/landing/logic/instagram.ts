/** Pure helpers for Instagram shortcodes — client-safe (no server-only). */

export const INSTAGRAM_POST_URL = (shortcode: string) =>
  `https://www.instagram.com/p/${shortcode}/`;

/**
 * Extract an Instagram shortcode from a paste: works with full URLs, short
 * urls, and raw embed code.
 */
export function parseInstagramShortcode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z0-9_-]{6,20}$/.test(trimmed)) return trimmed;
  const permalinkMatch = trimmed.match(/data-instgrm-permalink="([^"]+)"/);
  const urlCandidate = permalinkMatch ? permalinkMatch[1] : trimmed;
  const shortcodeMatch = urlCandidate.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]{6,20})/);
  return shortcodeMatch ? shortcodeMatch[1] : null;
}
