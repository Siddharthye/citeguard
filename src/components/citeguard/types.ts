import type { AskResult, AuditEntry, Citation } from "@/lib/types";

/** Document row shown in the UI (full body loaded on demand). */
export type DocumentSummary = {
  id: string;
  name: string;
  uploadedAt: string;
  effectiveDate: string;
  version?: string;
  policyFamily: string;
  currencyStatus?: "current" | "superseded";
  supersededByName?: string;
};

export type SourceView = {
  id: string;
  name: string;
  content: string;
  highlight: string;
};

export type { AskResult, AuditEntry, Citation };
