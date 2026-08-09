/**
 * Policy currency: which document versions are still valid to cite.
 *
 * Same policyFamily + different effectiveDate ⇒ newest on/before today wins;
 * older peers are superseded and must not ground answers.
 */
import type { Chunk, DocumentRecord, SupersededPolicyNote } from "./types";

export type DatedDocument = {
  doc: DocumentRecord;
  /** YYYY-MM-DD used for ranking */
  date: string;
};

export type CurrencyStatus = {
  /** Document ids that may be cited today */
  currentIds: Set<string>;
  /** supersededDocId → the document that replaced it */
  supersededBy: Map<string, DocumentRecord>;
};

/** Normalize a policy family key from an optional override or document name. */
export function derivePolicyFamily(name: string, explicit?: string): string {
  const raw = (explicit ?? name).trim().toLowerCase();
  const withoutExtension = raw.replace(/\.[^.]+$/, "");
  return withoutExtension
    .replace(/[-_\s]?v(?:ersion)?[-_\s]?\d+$/i, "")
    .replace(/[-_\s]\d{4}([-_]\d{2}){0,2}$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Prefer explicit YYYY-MM-DD; otherwise take the date portion of an ISO timestamp. */
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

function withEffectiveDate(doc: DocumentRecord): DatedDocument {
  return {
    doc,
    date: parseEffectiveDate(doc.effectiveDate, doc.uploadedAt),
  };
}

/** Newest effective date first; tie-break on upload time. */
function compareNewestFirst(a: DatedDocument, b: DatedDocument): number {
  const byDate = b.date.localeCompare(a.date);
  if (byDate !== 0) return byDate;
  return b.doc.uploadedAt.localeCompare(a.doc.uploadedAt);
}

function groupByFamily(
  documents: DocumentRecord[],
): Map<string, DocumentRecord[]> {
  const byFamily = new Map<string, DocumentRecord[]>();
  for (const doc of documents) {
    const family = doc.policyFamily || derivePolicyFamily(doc.name);
    const members = byFamily.get(family) ?? [];
    members.push(doc);
    byFamily.set(family, members);
  }
  return byFamily;
}

/**
 * Pick the current document for one policy family.
 * Prefer the latest effectiveDate on or before `asOf`.
 * If every version is in the future, fall back to the newest dated version.
 */
function pickCurrentInFamily(
  members: DocumentRecord[],
  asOf: string,
): DocumentRecord | undefined {
  const dated = members.map(withEffectiveDate);
  const eligible = dated
    .filter((item) => item.date <= asOf)
    .sort(compareNewestFirst);

  const pool =
    eligible.length > 0 ? eligible : [...dated].sort(compareNewestFirst);

  return pool[0]?.doc;
}

/**
 * Within each policy family, mark one document current and the rest superseded.
 */
export function resolveCurrency(
  documents: DocumentRecord[],
  asOf: string = new Date().toISOString().slice(0, 10),
): CurrencyStatus {
  const currentIds = new Set<string>();
  const supersededBy = new Map<string, DocumentRecord>();

  for (const members of groupByFamily(documents).values()) {
    const current = pickCurrentInFamily(members, asOf);
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

/** Drop chunks that belong to superseded / non-current documents. */
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

/** Human-readable notes for the UI / answer footer. */
export function describeSuperseded(
  documents: DocumentRecord[],
  currency: CurrencyStatus,
): SupersededPolicyNote[] {
  const notes: SupersededPolicyNote[] = [];

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
