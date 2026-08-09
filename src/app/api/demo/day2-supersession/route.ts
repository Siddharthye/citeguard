import { NextResponse } from "next/server";
import { addDocument, listDocuments } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLD_ID = "d2000000-0000-4000-8000-000000000001";
const NEW_ID = "d2000000-0000-4000-8000-000000000002";
const FAMILY = "leave-policy";
const QUESTION =
  "How many days of paid annual leave do employees receive?";

/**
 * Seeds an old (12 days / 2020) and current (22 days / 2024) leave policy
 * in the same family for the Day 2 supersession demo.
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

  return NextResponse.json({
    ok: true,
    question: QUESTION,
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
