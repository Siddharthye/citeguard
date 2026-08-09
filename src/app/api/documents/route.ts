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
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const uploadSchema = z.object({
  name: z.string().min(1).max(200),
  content: z.string().min(1).max(200_000),
  effectiveDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  version: z.string().max(40).optional(),
  policyFamily: z.string().max(120).optional(),
});

function listProjection() {
  return listDocuments().map(
    ({ id, name, uploadedAt, effectiveDate, version, policyFamily }) => ({
      id,
      name,
      uploadedAt,
      effectiveDate,
      version,
      policyFamily,
    }),
  );
}

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

  return NextResponse.json({ documents: listProjection() });
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
      const effectiveDate =
        typeof form.get("effectiveDate") === "string"
          ? String(form.get("effectiveDate"))
          : undefined;
      const version =
        typeof form.get("version") === "string"
          ? String(form.get("version"))
          : undefined;
      const policyFamily =
        typeof form.get("policyFamily") === "string"
          ? String(form.get("policyFamily"))
          : undefined;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const content = await extractTextFromUpload(String(name), bytes);
      const document = addDocument(String(name), content, undefined, {
        effectiveDate,
        version,
        policyFamily,
      });
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
    const document = addDocument(parsed.data.name, parsed.data.content, undefined, {
      effectiveDate: parsed.data.effectiveDate,
      version: parsed.data.version,
      policyFamily: parsed.data.policyFamily,
    });
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
