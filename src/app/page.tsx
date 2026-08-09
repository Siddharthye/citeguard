import { CiteGuardApp } from "@/components/CiteGuardApp";
import { resolveCurrency } from "@/lib/policy-version";
import { listAudit, listDocuments } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Home() {
  const allDocs = listDocuments();
  const currency = resolveCurrency(allDocs);
  const documents = allDocs.map(
    ({ id, name, uploadedAt, effectiveDate, version, policyFamily }) => ({
      id,
      name,
      uploadedAt,
      effectiveDate,
      version,
      policyFamily,
      currencyStatus: currency.currentIds.has(id)
        ? ("current" as const)
        : ("superseded" as const),
      supersededByName: currency.supersededBy.get(id)?.name,
    }),
  );
  const audit = listAudit().map(
    ({ id, question, answer, refused, citationCount, createdAt }) => ({
      id,
      question,
      answer,
      refused,
      citationCount,
      createdAt,
    }),
  );

  return (
    <CiteGuardApp initialDocuments={documents} initialAudit={audit} />
  );
}
