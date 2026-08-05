import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chunkText, tokenize } from "../chunk";
import { answerQuestion } from "../answer";
import { REFUSAL_THRESHOLD, scoreChunks } from "../retrieve";

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

    const result = await answerQuestion("How many paid leave days?", chunks);
    assert.equal(result.refused, false);
    assert.ok(result.citations.length > 0);
    assert.match(result.answer.toLowerCase(), /18/);
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
});
