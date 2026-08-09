/**
 * Citation Auditor (runtime) — executable counterpart of agents/citation-auditor.md.
 *
 * Checks (in order):
 * 1) Every citation quote appears in its source document
 * 2) Citations come from currently effective policy versions
 * 3) LLM answers do not introduce numbers absent from citations
 *
 * Wired from answer.ts via auditAnswerFaithfulness().
 */
import type { Citation, DocumentRecord } from "./types";
import { resolveCurrency } from "./policy-version";

export type FaithfulnessReport = {
  faithful: boolean;
  issues: string[];
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Strip trailing ellipsis added when truncating quotes for display. */
function quoteCore(quote: string): string {
  return quote.replace(/\.\.\.$/, "").trim();
}

/** Every citation quote must appear in its source document. */
export function auditCitationQuotes(
  citations: Citation[],
  documents: DocumentRecord[],
): FaithfulnessReport {
  const byId = new Map(documents.map((doc) => [doc.id, doc]));
  const issues: string[] = [];

  for (const citation of citations) {
    const doc = byId.get(citation.documentId);
    if (!doc) {
      issues.push(`Citation references missing document ${citation.documentId}`);
      continue;
    }

    const core = quoteCore(citation.quote);
    if (!core) {
      issues.push(`Empty citation quote for ${citation.documentName}`);
      continue;
    }

    if (!normalize(doc.content).includes(normalize(core))) {
      issues.push(
        `Quote not found in ${citation.documentName}: "${core.slice(0, 80)}"`,
      );
    }
  }

  return { faithful: issues.length === 0, issues };
}

/**
 * Numbers appearing in an LLM answer should also appear in at least one citation,
 * otherwise the model likely invented a figure.
 */
export function auditNumericGrounding(
  answer: string,
  citations: Citation[],
): FaithfulnessReport {
  const issues: string[] = [];
  const answerNumbers = answer.match(/\d+(?:\.\d+)?/g) ?? [];
  if (answerNumbers.length === 0) {
    return { faithful: true, issues };
  }

  const evidence = citations.map((citation) => citation.quote).join(" ");
  for (const num of new Set(answerNumbers)) {
    if (!evidence.includes(num)) {
      issues.push(`Answer contains uncited number: ${num}`);
    }
  }

  return { faithful: issues.length === 0, issues };
}

/**
 * Currency rule: citations must come from the currently effective policy version.
 * Superseded/expired versions are not valid grounding.
 */
export function auditCitationCurrency(
  citations: Citation[],
  documents: DocumentRecord[],
  asOf?: string,
): FaithfulnessReport {
  const currency = resolveCurrency(documents, asOf);
  const byId = new Map(documents.map((doc) => [doc.id, doc]));
  const issues: string[] = [];

  for (const citation of citations) {
    if (currency.currentIds.has(citation.documentId)) continue;
    const current = currency.supersededBy.get(citation.documentId);
    const doc = byId.get(citation.documentId);
    if (current) {
      issues.push(
        `Superseded policy cited: ${doc?.name ?? citation.documentName} ` +
          `(effective ${doc?.effectiveDate ?? "?"}) — current is ${current.name} ` +
          `(effective ${current.effectiveDate})`,
      );
    } else {
      issues.push(
        `Citation is not from a currently effective policy: ${citation.documentName}`,
      );
    }
  }

  return { faithful: issues.length === 0, issues };
}

export function auditAnswerFaithfulness(
  answer: string,
  citations: Citation[],
  documents: DocumentRecord[],
  mode: "extractive" | "llm",
): FaithfulnessReport {
  // Combine quote + currency checks; add numeric grounding only for LLM mode.
  const quoteAudit = auditCitationQuotes(citations, documents);
  const currencyAudit = auditCitationCurrency(citations, documents);
  const issues = [...quoteAudit.issues, ...currencyAudit.issues];

  if (mode === "llm") {
    const numeric = auditNumericGrounding(answer, citations);
    issues.push(...numeric.issues);
  }

  return { faithful: issues.length === 0, issues };
}
