/**
 * Domain types for CiteGuard.
 * Keep API/UI DTOs thin projections of these shapes — do not fork the model.
 */

/** A stored policy document (one version). */
export type DocumentRecord = {
  id: string;
  name: string;
  content: string;
  uploadedAt: string;
  /** YYYY-MM-DD — when this version became effective */
  effectiveDate: string;
  /** Optional label such as "2020" or "v3" */
  version?: string;
  /** Groups revisions of the same policy for supersession */
  policyFamily: string;
};

export type SupersededPolicyNote = {
  name: string;
  effectiveDate: string;
  supersededByName: string;
  supersededByEffectiveDate: string;
};

/** Overlapping text window used for retrieval. */
export type Chunk = {
  id: string;
  documentId: string;
  documentName: string;
  index: number;
  text: string;
};

export type Citation = {
  documentId: string;
  documentName: string;
  chunkId: string;
  chunkIndex: number;
  quote: string;
  score: number;
};

/** User-facing result of POST /api/ask (and Day 2 demo). */
export type AskResult = {
  answer: string;
  refused: boolean;
  citations: Citation[];
  mode: "extractive" | "llm";
  /** Runtime Citation Auditor: quotes real + currently effective */
  faithful: boolean;
  auditIssues: string[];
  /** Citations span more than one document (possible conflict) */
  multiSource: boolean;
  /** Older peers in the same family that were excluded */
  superseded: SupersededPolicyNote[];
};

export type AuditEntry = {
  id: string;
  question: string;
  answer: string;
  refused: boolean;
  citationCount: number;
  createdAt: string;
};
