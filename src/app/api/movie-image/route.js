import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAllowedImageUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Proxy remote posters so the WebGL loader stays same-origin.
 * Production CDNs often block hotlinks — fetch with browser-like headers.
 */
export async function GET(request) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !isAllowedImageUrl(url)) {
    return new NextResponse("Invalid image URL", { status: 400 });
  }

  let timer;
  try {
    const controller = new AbortController();
    timer = setTimeout(() => controller.abort(), 12000);

    const upstream = await fetch(url, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: new URL(url).origin + "/",
      },
      redirect: "follow",
      cache: "force-cache",
      signal: controller.signal,
    });

    if (!upstream.ok) {
      return new NextResponse("Image not found", { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
      return new NextResponse("Not an image", { status: 415 });
    }

    const buffer = await upstream.arrayBuffer();
    if (!buffer.byteLength) {
      return new NextResponse("Empty image", { status: 502 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType.startsWith("image/") ? contentType : "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.warn("[movie-image] fetch failed:", url, error?.message || error);
    return new NextResponse("Failed to fetch image", { status: 502 });
  } finally {
    if (timer) clearTimeout(timer);
  }
}
