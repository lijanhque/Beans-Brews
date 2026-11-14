import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/server-auth";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to upload media." }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Media uploads are not configured. Set BLOB_READ_WRITE_TOKEN on the server." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return NextResponse.json(
      { error: "Upload a JPEG, PNG, WebP, or GIF image." },
      { status: 415 },
    );
  }
  if (file.size === 0 || file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Images must be between 1 byte and 10 MB." }, { status: 413 });
  }

  const blob = await put(`store-media/${crypto.randomUUID()}.${extension}`, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  });
  return NextResponse.json({ url: blob.url });
}
