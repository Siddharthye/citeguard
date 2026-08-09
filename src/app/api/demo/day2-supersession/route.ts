import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/answer";
import { addDocument, getChunks, listDocuments } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLD_ID = "d2000000-0000-4000-8000-000000000001";
const NEW_ID = "d2000000-0000-4000-8000-000000000002";
const FAMILY = "leave-policy";
const QUESTION =
  "How many days of paid annual leave do employees receive?";

/**
 * Seeds old (12d/2020) + current (22d/2024) leave policies and answers
 * on the **same** serverless instance (avoids Vercel memory split).
 */
export async function POST() {
  addDocument(
    "leave-policy-2020.md",
    "Employees receive 12 days of paid annual leave each calendar year.\nLeave requests must be submitted at least 14 days in advance.",
    OLD_ID,
    {
      effectiveDate: "2020-01-01",
      version: "2020",
      policyFamily: FAMILY,
    },
  );
  addDocument(
    "leave-policy-2024.md",
    "Employees receive 22 days of paid annual leave each calendar year.\nLeave requests must be submitted at least 7 days in advance through the HR portal.",
    NEW_ID,
    {
      effectiveDate: "2024-06-01",
      version: "2024",
      policyFamily: FAMILY,
    },
  );

  const docs = listDocuments().filter(
    (doc) => doc.policyFamily === FAMILY || doc.id === OLD_ID || doc.id === NEW_ID,
  );
  const docIds = new Set(docs.map((doc) => doc.id));
  const chunks = getChunks().filter((chunk) => docIds.has(chunk.documentId));
  const result = await answerQuestion(QUESTION, chunks, docs);

  return NextResponse.json({
    ok: true,
    question: QUESTION,
    result,
    documents: listDocuments()
      .filter((doc) => doc.id === OLD_ID || doc.id === NEW_ID)
      .map(({ id, name, effectiveDate, version, policyFamily }) => ({
        id,
        name,
        effectiveDate,
        version,
        policyFamily,
      })),
  });
}
