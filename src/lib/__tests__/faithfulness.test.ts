import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  auditAnswerFaithfulness,
  auditCitationQuotes,
  auditNumericGrounding,
} from "../faithfulness";
import type { Citation, DocumentRecord } from "../types";

const doc: DocumentRecord = {
  id: "d1",
  name: "policy.md",
  content:
    "Employees receive 18 days of paid annual leave each calendar year.",
  uploadedAt: new Date().toISOString(),
};

const citation: Citation = {
  documentId: "d1",
  documentName: "policy.md",
  chunkId: "d1-0",
  chunkIndex: 0,
  quote: "Employees receive 18 days of paid annual leave each calendar year.",
  score: 0.9,
};

describe("citation faithfulness auditor", () => {
  it("passes when quotes exist in the source document", () => {
    const report = auditCitationQuotes([citation], [doc]);
    assert.equal(report.faithful, true);
    assert.equal(report.issues.length, 0);
  });

  it("fails when a quote is not in the source", () => {
    const bad: Citation = {
      ...citation,
      quote: "Employees receive 99 days of unlimited pizza leave.",
    };
    const report = auditCitationQuotes([bad], [doc]);
    assert.equal(report.faithful, false);
    assert.ok(report.issues[0].includes("Quote not found"));
  });

  it("flags uncited numbers in LLM answers", () => {
    const report = auditNumericGrounding(
      "Employees get 99 days of leave [1].",
      [citation],
    );
    assert.equal(report.faithful, false);
    assert.ok(report.issues.some((issue) => issue.includes("99")));
  });

  it("accepts numbers grounded in citations", () => {
    const report = auditNumericGrounding(
      "Employees get 18 days of leave [1].",
      [citation],
    );
    assert.equal(report.faithful, true);
  });

  it("combined audit rejects fabricated LLM answers", () => {
    const report = auditAnswerFaithfulness(
      "Policy grants 99 remote days [1].",
      [citation],
      [doc],
      "llm",
    );
    assert.equal(report.faithful, false);
  });
});
