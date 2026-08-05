import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addDocument,
  deleteDocument,
  listDocuments,
} from "@/lib/store";

export const runtime = "nodejs";

const uploadSchema = z.object({
  name: z.string().min(1).max(200),
  content: z.string().min(1).max(200_000),
});

export async function GET() {
  return NextResponse.json({ documents: listDocuments() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = uploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload. Provide name and content." },
      { status: 400 },
    );
  }

  const document = addDocument(parsed.data.name, parsed.data.content);
  return NextResponse.json({ document }, { status: 201 });
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
