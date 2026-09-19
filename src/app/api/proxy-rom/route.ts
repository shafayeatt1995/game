import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const parsed = new URL(targetUrl);
    // Allow archive.org, github, cdnjs, raw.githubusercontent.com, uploadthing etc.
    const allowedHosts = [
      "archive.org",
      "ia80",
      "ia60",
      "ia90",
      "raw.githubusercontent.com",
      "github.com",
      "cdn.emulatorjs.org",
      "utfs.io",
      "ufs.sh",
      "uploadthing.com",
    ];

    const isAllowed = allowedHosts.some(host => parsed.hostname.includes(host));
    if (!isAllowed) {
      return NextResponse.json({ error: "Domain not allowed for proxy" }, { status: 403 });
    }

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Remote server responded with ${res.status}: ${res.statusText}` },
        { status: res.status }
      );
    }

    const headers = new Headers();
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const contentLength = res.headers.get("content-length");

    headers.set("Content-Type", contentType);
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    headers.set("Cache-Control", "public, max-age=86400, immutable");

    return new NextResponse(res.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: error.message || "Proxy fetch failed" }, { status: 500 });
  }
}
