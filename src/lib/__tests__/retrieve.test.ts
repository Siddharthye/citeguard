import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chunkText, tokenize } from "../chunk";
import { answerQuestion } from "../answer";
import { REFUSAL_THRESHOLD, scoreChunks } from "../retrieve";
import { doc } from "./helpers";

describe("tokenize", () => {
  it("drops stopwords", () => {
    assert.deepEqual(tokenize("The leave policy is clear"), [
      "leave",
      "policy",
      "clear",
    ]);
  });
});

describe("chunkText", () => {
  it("creates overlapping chunks", () => {
    const text = "A".repeat(1200);
    const chunks = chunkText(text, "doc-1", "sample.txt", 400, 50);
    assert.ok(chunks.length > 1);
    assert.equal(chunks[0].documentName, "sample.txt");
  });
});

describe("retrieval + answer", () => {
  const policy = `Employees receive 18 days of paid annual leave each calendar year.
Expenses of $75 or more require written manager approval before purchase.`;

  it("answers in-scope questions with citations", async () => {
    const chunks = chunkText(policy, "d1", "policy.md");
    const scored = scoreChunks("How many paid leave days?", chunks);
    assert.ok(scored[0].score > REFUSAL_THRESHOLD);

    const docs = [doc("d1", "policy.md", policy)];
    const result = await answerQuestion(
      "How many paid leave days?",
      chunks,
      docs,
    );
    assert.equal(result.refused, false);
    assert.ok(result.citations.length > 0);
    assert.match(result.answer.toLowerCase(), /18/);
    assert.equal(result.faithful, true);
  });

  it("refuses out-of-scope questions", async () => {
    const chunks = chunkText(policy, "d1", "policy.md");
    const result = await answerQuestion(
      "What is the CEO middle name and favorite pizza topping?",
      chunks,
    );
    assert.equal(result.refused, true);
    assert.equal(result.citations.length, 0);
    assert.match(result.answer, /I don't know/i);
  });

  it("refuses pizza questions that only share a weak token like week", async () => {
    const fullPolicy = `Employees receive 18 days of paid annual leave each calendar year.
Employees may work remotely up to 3 days per week after completing probation.`;
    const chunks = chunkText(fullPolicy, "d1", "policy.md");
    const result = await answerQuestion(
      "What is the cafeteria pizza topping of the week?",
      chunks,
    );
    assert.equal(result.refused, true);
    assert.equal(result.citations.length, 0);
  });

  it("cites the current policy version and notes the superseded one", async () => {
    const oldPolicy =
      "Employees receive 12 days of paid annual leave each calendar year.";
    const newPolicy =
      "Employees receive 22 days of paid annual leave each calendar year.";
    const chunks = [
      ...chunkText(oldPolicy, "old", "leave-policy-2020.md"),
      ...chunkText(newPolicy, "new", "leave-policy-2024.md"),
    ];
    const docs = [
      doc("old", "leave-policy-2020.md", oldPolicy, {
        effectiveDate: "2020-01-01",
        version: "2020",
        policyFamily: "leave-policy",
      }),
      doc("new", "leave-policy-2024.md", newPolicy, {
        effectiveDate: "2024-06-01",
        version: "2024",
        policyFamily: "leave-policy",
      }),
    ];

    const result = await answerQuestion(
      "How many days of paid annual leave do employees receive?",
      chunks,
      docs,
    );

    assert.equal(result.refused, false);
    assert.match(result.answer, /22/);
    assert.doesNotMatch(result.answer.split("Superseded")[0] ?? "", /\b12\b/);
    assert.ok(
      result.citations.every((citation) => citation.documentId === "new"),
    );
    assert.equal(result.superseded.length, 1);
    assert.match(result.answer, /superseded/i);
    assert.match(result.answer, /leave-policy-2020/i);
    assert.equal(result.faithful, true);
  });
});
