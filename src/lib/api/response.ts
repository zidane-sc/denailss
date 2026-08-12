import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { toApiError } from "./errors";

export function apiSuccess<T>(data: T, meta: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ data, meta }, { status });
}

/**
 * Public GET response with `no-cache` + ETag. Never returns 304: a 304 has no
 * body, so client reads of `res.ok` / `res.json()` treat it as a failure and
 * keep stale state. Always ship the full payload; the ETag is informational.
 */
export function cachedApiSuccess<T>(data: T, meta: Record<string, unknown> = {}) {
  const body = JSON.stringify({ data, meta });
  const etag = `"${createHash("sha1").update(body).digest("hex")}"`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-cache",
      etag,
    },
  });
}

export function apiFailure(error: unknown) {
  const apiError = toApiError(error);
  return NextResponse.json(
    { error: { code: apiError.code, message: apiError.message } },
    { status: apiError.status }
  );
}
