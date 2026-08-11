import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { toApiError } from "./errors";

export function apiSuccess<T>(data: T, meta: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ data, meta }, { status });
}

/**
 * Public GET with ETag revalidation. Client providers re-fetch on mount and
 * on tab focus; with `cache: "no-cache"` those repeat reads come back as a
 * cheap 304 instead of re-shipping the full payload. Fresh data still arrives
 * as a normal 200 when the ETag changes.
 */
export function cachedApiSuccess<T>(data: T, request: Request, meta: Record<string, unknown> = {}) {
  const body = JSON.stringify({ data, meta });
  const etag = `"${createHash("sha1").update(body).digest("hex")}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304 });
  }
  return new Response(body, {
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
