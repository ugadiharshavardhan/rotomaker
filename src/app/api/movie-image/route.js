import { NextResponse } from "next/server";

function isAllowedImageUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET(request) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !isAllowedImageUrl(url)) {
    return new NextResponse("Invalid image URL", { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        Accept: "image/*,*/*",
        "User-Agent": "Mozilla/5.0 (compatible; RotomakerVFX/1.0)",
      },
      redirect: "follow",
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      return new NextResponse("Image not found", { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
