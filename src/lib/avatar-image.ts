import sharp from "sharp";

export const MAX_AVATAR_UPLOAD_BYTES = 8 * 1024 * 1024;
export const AVATAR_EDGE_PX = 512;

const MAX_AVATAR_INPUT_PIXELS = 50_000_000;
const ACCEPTED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export class AvatarImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AvatarImageError";
  }
}

export async function optimizeAvatarUpload(file: File) {
  if (!ACCEPTED_AVATAR_TYPES.has(file.type)) {
    throw new AvatarImageError("Use a JPEG, PNG, WebP, or GIF image.");
  }
  if (file.size > MAX_AVATAR_UPLOAD_BYTES) {
    throw new AvatarImageError("Keep your profile picture at or below 8 MB.");
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const output = await sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_AVATAR_INPUT_PIXELS,
      pages: 1,
    })
      .rotate()
      .resize(AVATAR_EDGE_PX, AVATAR_EDGE_PX, {
        fit: "cover",
        position: "attention",
      })
      .webp({
        quality: 82,
        alphaQuality: 90,
        effort: 4,
        smartSubsample: true,
      })
      .toBuffer();

    return {
      bytes: new Uint8Array(output),
      mimeType: "image/webp" as const,
    };
  } catch {
    throw new AvatarImageError(
      "That image could not be processed. Use a valid image under 50 megapixels.",
    );
  }
}
