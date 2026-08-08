import { NextRequest } from "next/server";

/**
 * Serves a post image from Instagram's public `/media/?size=l` redirect
 * endpoint. Keeps the signed CDN URL off the client and lets the grid render
 * real post photos without relying on the embed widget's iframe.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shortcode: string }> }
) {
  const { shortcode } = await params;

  if (!/^[A-Za-z0-9_-]{6,20}$/.test(shortcode)) {
    return new Response("invalid shortcode", { status: 400 });
  }

  const url = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
  const upstream = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0" },
    cache: "force-cache",
    next: { revalidate: 86400 },
  });

  if (!upstream.ok) {
    return new Response("upstream error", { status: upstream.status });
  }

  const headers = new Headers();
  headers.set("content-type", upstream.headers.get("content-type") ?? "image/jpeg");
  headers.set("cache-control", "public, s-maxage=86400, stale-while-revalidate=86400");

  return new Response(upstream.body, { headers });
}
