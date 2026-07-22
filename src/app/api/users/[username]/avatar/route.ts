import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const username = decodeURIComponent((await params).username).toLowerCase();
  const avatar = await prisma.user.findUnique({
    where: { username },
    select: { avatarBytes: true, avatarMimeType: true, avatarUpdatedAt: true },
  });
  if (!avatar?.avatarBytes || !avatar.avatarMimeType) {
    return new Response(null, { status: 404 });
  }

  const etag = `"${avatar.avatarUpdatedAt?.getTime() ?? 0}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  return new Response(Uint8Array.from(avatar.avatarBytes), {
    headers: {
      "Cache-Control": "public, max-age=60, must-revalidate",
      "Content-Type": avatar.avatarMimeType,
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
