import { NextResponse } from "next/server";
import { z } from "zod";
import { extractTextFromUpload } from "@/lib/extract";
import {
  addDocument,
  deleteDocument,
  getDocument,
  listDocuments,
} from "@/lib/store";

export const runtime = "nodejs";

const uploadSchema = z.object({
  name: z.string().min(1).max(200),
  content: z.string().min(1).max(200_000),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const document = getDocument(id);
    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ document });
  }

  const documents = listDocuments().map(({ id, name, uploadedAt }) => ({
    id,
    name,
    uploadedAt,
  }));
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Expected file field in multipart upload." },
          { status: 400 },
        );
      }
      const name =
        (typeof form.get("name") === "string" && form.get("name")) ||
        file.name ||
        "upload.bin";
      const bytes = new Uint8Array(await file.arrayBuffer());
      const content = await extractTextFromUpload(String(name), bytes);
      const document = addDocument(String(name), content);
      return NextResponse.json({ document }, { status: 201 });
    }

    const body = await request.json().catch(() => null);
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid upload. Provide name and content, or multipart file." },
        { status: 400 },
      );
    }
    const document = addDocument(parsed.data.name, parsed.data.content);
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process upload.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const ok = deleteDocument(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
