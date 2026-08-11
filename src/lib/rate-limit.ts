import { ApiError } from "@/lib/api/errors";

type RateLimitEntry = { count: number; resetAt: number };

const entries = new Map<string, RateLimitEntry>();

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function enforceRateLimit(request: Request, scope: string, options: { limit: number; windowMs: number; identity?: string }) {
  const now = Date.now();
  const key = `${scope}:${getClientIp(request)}:${options.identity ?? "anonymous"}`;
  const current = entries.get(key);

  if (!current || current.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  if (current.count >= options.limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    throw new ApiError("RATE_LIMITED", `Terlalu banyak upload. Coba lagi dalam ${retryAfter} detik.`, 429);
  }

  current.count += 1;
}

export function rateLimitHeaders(request: Request, scope: string, identity?: string) {
  const key = `${scope}:${getClientIp(request)}:${identity ?? "anonymous"}`;
  const current = entries.get(key);
  return current ? { "Retry-After": String(Math.max(1, Math.ceil((current.resetAt - Date.now()) / 1000))) } : {};
}
