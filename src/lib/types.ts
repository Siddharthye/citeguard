export type DocumentRecord = {
  id: string;
  name: string;
  content: string;
  uploadedAt: string;
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
};

export type AuditEntry = {
  id: string;
  question: string;
  answer: string;
  refused: boolean;
  citationCount: number;
  createdAt: string;
};
