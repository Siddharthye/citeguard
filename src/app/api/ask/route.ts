import { NextResponse } from "next/server";
import { z } from "zod";
import { answerQuestion } from "@/lib/answer";
import { addAudit, getChunks, listDocuments } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const askSchema = z.object({
  question: z.string().min(3).max(2000),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = askSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Question must be at least 3 characters." },
      { status: 400 },
    );
  }

  const result = await answerQuestion(
    parsed.data.question,
    getChunks(),
    listDocuments(),
  );

  addAudit({
    question: parsed.data.question,
    answer: result.answer,
    refused: result.refused,
    citationCount: result.citations.length,
  });

  return NextResponse.json(result);
}
