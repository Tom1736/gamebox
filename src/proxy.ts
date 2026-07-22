import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/rate-limit";

function clientAddress(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function proxy(request: NextRequest) {
  const result = consumeRateLimit({
    key: `request:${clientAddress(request)}`,
    limit: 180,
    windowMs: 60_000,
  });

  if (!result.allowed) {
    const headers = {
      "Cache-Control": "no-store",
      "Retry-After": String(result.retryAfterSeconds),
      "X-RateLimit-Remaining": "0",
    };

    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429, headers },
      );
    }

    return new NextResponse("Too many requests. Please wait a moment and try again.", {
      status: 429,
      headers,
    });
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
