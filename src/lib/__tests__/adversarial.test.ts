import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { answerQuestion, REFUSAL } from "../answer";
import { chunkText } from "../chunk";
import { auditCitationQuotes, auditCitationCurrency } from "../faithfulness";
import { doc } from "./helpers";

describe("adversarial answer behavior", () => {
  it("refuses empty-ish nonsense against a real policy", async () => {
    const policy =
      "Employees receive 18 days of paid annual leave each calendar year.";
    const chunks = chunkText(policy, "d1", "policy.md");
    const result = await answerQuestion(
      "asdf qwer zxcv quantum banana protocol?",
      chunks,
      [doc("d1", "policy.md", policy)],
    );
    assert.equal(result.refused, true);
    assert.equal(result.answer, REFUSAL);
    assert.equal(result.citations.length, 0);
    assert.equal(result.faithful, true);
  });

  it("marks multi-source when two policies both match", async () => {
    const leaveA = "Team A handbook: paid leave is 18 days per year.";
    const leaveB = "Team B handbook: paid leave is 22 days per year.";
    const chunks = [
      ...chunkText(leaveA, "a", "team-a.md"),
      ...chunkText(leaveB, "b", "team-b.md"),
    ];
    const docs = [
      doc("a", "team-a.md", leaveA, { policyFamily: "team-a" }),
      doc("b", "team-b.md", leaveB, { policyFamily: "team-b" }),
    ];
    const result = await answerQuestion(
      "How many paid leave days are in the handbook?",
      chunks,
      docs,
    );
    assert.equal(result.refused, false);
    assert.ok(result.citations.length >= 1);
    const quoteAudit = auditCitationQuotes(result.citations, docs);
    assert.equal(quoteAudit.faithful, true);
    if (result.citations.length > 1) {
      assert.equal(result.multiSource, true);
    }
  });

  it("keeps citation quotes faithful for extractive answers", async () => {
    const policy =
      "Expenses of $75 or more require written manager approval before purchase.";
    const chunks = chunkText(policy, "d1", "policy.md");
    const docs = [doc("d1", "policy.md", policy)];
    const result = await answerQuestion(
      "When is manager approval required for expenses?",
      chunks,
      docs,
    );
    assert.equal(result.refused, false);
    assert.equal(result.faithful, true);
    const audit = auditCitationQuotes(result.citations, docs);
    assert.equal(audit.faithful, true);
  });

  it("auditor flags citations from superseded policy versions", () => {
    const oldPolicy = "Employees receive 12 days of paid annual leave.";
    const newPolicy = "Employees receive 22 days of paid annual leave.";
    const docs = [
      doc("old", "leave-policy-2020.md", oldPolicy, {
        effectiveDate: "2020-01-01",
        policyFamily: "leave-policy",
      }),
      doc("new", "leave-policy-2024.md", newPolicy, {
        effectiveDate: "2024-06-01",
        policyFamily: "leave-policy",
      }),
    ];
    const badCitation = {
      documentId: "old",
      documentName: "leave-policy-2020.md",
      chunkId: "c1",
      chunkIndex: 0,
      quote: oldPolicy,
      score: 0.9,
    };
    const report = auditCitationCurrency([badCitation], docs);
    assert.equal(report.faithful, false);
    assert.match(report.issues.join(" "), /superseded/i);
  });
});
