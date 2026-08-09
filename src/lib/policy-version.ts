import type { Chunk, DocumentRecord } from "./types";

/** Normalize a policy family key from an optional override or document name. */
export function derivePolicyFamily(name: string, explicit?: string): string {
  const raw = (explicit ?? name).trim().toLowerCase();
  const base = raw.replace(/\.[^.]+$/, "");
  return base
    .replace(/[-_\s]?v(?:ersion)?[-_\s]?\d+$/i, "")
    .replace(/[-_\s]\d{4}([-_]\d{2}){0,2}$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseEffectiveDate(
  value: string | undefined,
  fallbackIso: string,
): string {
  if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  if (fallbackIso && /^\d{4}-\d{2}-\d{2}/.test(fallbackIso)) {
    return fallbackIso.slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export type CurrencyStatus = {
  currentIds: Set<string>;
  /** docId → current document that supersedes it */
  supersededBy: Map<string, DocumentRecord>;
};

/**
 * Within each policy family, the document with the latest effectiveDate
 * on or before `asOf` is current. Others in that family are superseded.
 */
export function resolveCurrency(
  documents: DocumentRecord[],
  asOf: string = new Date().toISOString().slice(0, 10),
): CurrencyStatus {
  const byFamily = new Map<string, DocumentRecord[]>();

  for (const doc of documents) {
    const family = doc.policyFamily || derivePolicyFamily(doc.name);
    const list = byFamily.get(family) ?? [];
    list.push(doc);
    byFamily.set(family, list);
  }

  const currentIds = new Set<string>();
  const supersededBy = new Map<string, DocumentRecord>();

  for (const members of byFamily.values()) {
    const eligible = members
      .map((doc) => ({
        doc,
        date: parseEffectiveDate(doc.effectiveDate, doc.uploadedAt),
      }))
      .filter(({ date }) => date <= asOf)
      .sort((a, b) => b.date.localeCompare(a.date) || b.doc.uploadedAt.localeCompare(a.doc.uploadedAt));

    const pool = eligible.length > 0
      ? eligible
      : members
          .map((doc) => ({
            doc,
            date: parseEffectiveDate(doc.effectiveDate, doc.uploadedAt),
          }))
          .sort((a, b) => b.date.localeCompare(a.date));

    const current = pool[0]?.doc;
    if (!current) continue;

    currentIds.add(current.id);
    for (const member of members) {
      if (member.id !== current.id) {
        supersededBy.set(member.id, current);
      }
    }
  }

  return { currentIds, supersededBy };
}

export function isDocumentCurrent(
  docId: string,
  currency: CurrencyStatus,
): boolean {
  return currency.currentIds.has(docId);
}

/** Keep only chunks from currently effective policy versions. */
export function filterCurrentChunks(
  chunks: Chunk[],
  documents: DocumentRecord[],
  asOf?: string,
): { chunks: Chunk[]; currency: CurrencyStatus } {
  const currency = resolveCurrency(documents, asOf);
  return {
    chunks: chunks.filter((chunk) => currency.currentIds.has(chunk.documentId)),
    currency,
  };
}

export function describeSuperseded(
  documents: DocumentRecord[],
  currency: CurrencyStatus,
): Array<{
  name: string;
  effectiveDate: string;
  supersededByName: string;
  supersededByEffectiveDate: string;
}> {
  const notes: Array<{
    name: string;
    effectiveDate: string;
    supersededByName: string;
    supersededByEffectiveDate: string;
  }> = [];

  for (const doc of documents) {
    const current = currency.supersededBy.get(doc.id);
    if (!current) continue;
    notes.push({
      name: doc.name,
      effectiveDate: parseEffectiveDate(doc.effectiveDate, doc.uploadedAt),
      supersededByName: current.name,
      supersededByEffectiveDate: parseEffectiveDate(
        current.effectiveDate,
        current.uploadedAt,
      ),
    });
  }

  return notes.sort((a, b) => a.name.localeCompare(b.name));
}
