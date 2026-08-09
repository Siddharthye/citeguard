export type DocumentRecord = {
  id: string;
  name: string;
  content: string;
  uploadedAt: string;
  /** ISO date YYYY-MM-DD — when this policy version became effective */
  effectiveDate: string;
  /** Optional human version label (e.g. "2020", "v3") */
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

export type AskResult = {
  answer: string;
  refused: boolean;
  citations: Citation[];
  mode: "extractive" | "llm";
  /** Runtime Citation Auditor result */
  faithful: boolean;
  auditIssues: string[];
  /** True when citations span more than one document */
  multiSource: boolean;
  /** Expired/superseded peers in the same policy family (informational) */
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
