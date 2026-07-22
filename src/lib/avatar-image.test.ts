import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  AVATAR_EDGE_PX,
  AvatarImageError,
  MAX_AVATAR_UPLOAD_BYTES,
  optimizeAvatarUpload,
} from "./avatar-image";

describe("optimizeAvatarUpload", () => {
  it("crops and converts uploaded images to a 512px WebP", async () => {
    const input = await sharp({
      create: {
        width: 1600,
        height: 900,
        channels: 3,
        background: "#84cc16",
      },
    })
      .jpeg()
      .toBuffer();
    const file = new File([Uint8Array.from(input)], "avatar.jpg", {
      type: "image/jpeg",
    });

    const result = await optimizeAvatarUpload(file);
    const metadata = await sharp(result.bytes).metadata();

    expect(result.mimeType).toBe("image/webp");
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(AVATAR_EDGE_PX);
    expect(metadata.height).toBe(AVATAR_EDGE_PX);
  });

  it("rejects uploads larger than 8 MB", async () => {
    const file = new File(
      [new Uint8Array(MAX_AVATAR_UPLOAD_BYTES + 1)],
      "avatar.jpg",
      { type: "image/jpeg" },
    );

    await expect(optimizeAvatarUpload(file)).rejects.toThrow(
      "Keep your profile picture at or below 8 MB.",
    );
  });

  it("rejects invalid image content", async () => {
    const file = new File(["not an image"], "avatar.jpg", {
      type: "image/jpeg",
    });

    await expect(optimizeAvatarUpload(file)).rejects.toBeInstanceOf(
      AvatarImageError,
    );
  });
});
