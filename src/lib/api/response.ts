import { NextResponse } from "next/server";
import { toApiError } from "./errors";

export function apiSuccess<T>(data: T, meta: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ data, meta }, { status });
}

export function apiFailure(error: unknown) {
  const apiError = toApiError(error);
  return NextResponse.json(
    { error: { code: apiError.code, message: apiError.message } },
    { status: apiError.status }
  );
}
