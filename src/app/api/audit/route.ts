import { NextResponse } from "next/server";
import { auditToCsv, listAudit } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  if (format === "csv") {
    const csv = auditToCsv(listAudit());
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="citeguard-audit.csv"',
      },
    });
  }

  return NextResponse.json({ entries: listAudit() });
}
