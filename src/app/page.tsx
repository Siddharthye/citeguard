import { CiteGuardApp } from "@/components/CiteGuardApp";
import { listAudit, listDocuments } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Home() {
  const documents = listDocuments().map(({ id, name, uploadedAt }) => ({
    id,
    name,
    uploadedAt,
  }));
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
