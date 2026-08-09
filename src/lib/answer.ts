/**
 * Answer orchestration: currency filter → retrieve → cite/refuse → auditor.
 * Keep this file as the single place that decides what the user sees.
 */
import { auditAnswerFaithfulness } from "./faithfulness";
import {
  describeSuperseded,
  filterCurrentChunks,
} from "./policy-version";
import { REFUSAL_THRESHOLD, scoreChunks, toCitations } from "./retrieve";
import type {
  AskResult,
  Chunk,
  Citation,
  DocumentRecord,
  SupersededPolicyNote,
} from "./types";

export const REFUSAL =
  "I don't know based on the provided documents. No passage was relevant enough to cite.";

export const SUPERSEDED_REFUSAL =
  "I won't cite a superseded policy version. Upload or select the currently effective document, or ask again after the current version is available.";

function formatSupersededNotes(superseded: SupersededPolicyNote[]): string {
  return superseded
    .map(
      (item) =>
        `- ${item.name} (effective ${item.effectiveDate}) is superseded by ` +
        `${item.supersededByName} (effective ${item.supersededByEffectiveDate})`,
    )
    .join("\n");
}

function appendSupersededFooter(
  answer: string,
  superseded: SupersededPolicyNote[],
): string {
  if (superseded.length === 0) return answer;
  return `${answer}\n\nSuperseded versions (not used as valid citations):\n${formatSupersededNotes(superseded)}`;
}

function buildExtractiveAnswer(
  citations: Citation[],
  superseded: SupersededPolicyNote[],
): string {
  const base =
    citations.length === 1
      ? `According to ${citations[0].documentName}: ${citations[0].quote}`
      : `Based on the provided documents:\n\n${citations
          .map(
            (citation, index) =>
              `(${index + 1}) From ${citation.documentName}: ${citation.quote}`,
          )
          .join("\n\n")}`;

  return appendSupersededFooter(base, superseded);
}

function detectMultiSource(citations: Citation[]): boolean {
  return new Set(citations.map((citation) => citation.documentId)).size > 1;
}

function hasSupersededAuditIssue(issues: string[]): boolean {
  return issues.some((issue) => /superseded/i.test(issue));
}

function refusedResult(
  answer: string,
  mode: AskResult["mode"],
  superseded: SupersededPolicyNote[] = [],
  auditIssues: string[] = [],
): AskResult {
  return {
    answer,
    refused: true,
    citations: [],
    mode,
    faithful: true,
    auditIssues,
    multiSource: false,
    superseded,
  };
}

function groundedResult(
  answer: string,
  citations: Citation[],
  mode: AskResult["mode"],
  documents: DocumentRecord[],
  superseded: SupersededPolicyNote[],
  extraIssues: string[] = [],
): AskResult {
  const audit = auditAnswerFaithfulness(answer, citations, documents, mode);

  // Defense in depth: if a superseded quote slipped through retrieval, refuse.
  if (!audit.faithful && hasSupersededAuditIssue(audit.issues)) {
    return refusedResult(SUPERSEDED_REFUSAL, mode, superseded, audit.issues);
  }

  return {
    answer,
    refused: false,
    citations,
    mode,
    faithful: audit.faithful,
    auditIssues: [...extraIssues, ...audit.issues],
    multiSource: detectMultiSource(citations),
    superseded,
  };
}

/** Optional LLM refine — disabled unless LLM_* env vars are set (CI stays extractive). */
async function maybeRefineWithLlm(
  question: string,
  citations: Citation[],
): Promise<string | null> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL;
  const model = process.env.LLM_MODEL ?? "meta/llama-3.1-8b-instruct";

  if (!apiKey || !baseUrl) return null;

  const evidence = citations
    .map(
      (citation, index) =>
        `[${index + 1}] (${citation.documentName}) ${citation.quote}`,
    )
    .join("\n\n");

  const system = `You are CiteGuard, a compliance Q&A assistant.
Answer ONLY using the numbered evidence passages.
Every factual claim must reference citations like [1] or [1][2].
If the evidence is insufficient, reply exactly: ${REFUSAL}
Do not invent policies, numbers, or procedures.
Never treat superseded or expired policy text as current.`;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Question: ${question}\n\nEvidence:\n${evidence}`,
          },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export async function answerQuestion(
  question: string,
  chunks: Chunk[],
  documents: DocumentRecord[] = [],
): Promise<AskResult> {
  // 1) Currency: only currently effective policy versions are eligible evidence.
  const { chunks: currentChunks, currency } = filterCurrentChunks(
    chunks,
    documents,
  );
  const superseded = describeSuperseded(documents, currency);

  // 2) Retrieve against current chunks only.
  const scored = scoreChunks(question, currentChunks);
  const bestScore = scored[0]?.score ?? 0;
  if (bestScore < REFUSAL_THRESHOLD) {
    return refusedResult(REFUSAL, "extractive", superseded);
  }

  const citations = toCitations(scored, 3);

  // 3) Optional LLM refine; auditor may veto and fall back to extractive quotes.
  const llmAnswer = await maybeRefineWithLlm(question, citations);
  if (llmAnswer) {
    if (llmAnswer.includes("I don't know based on the provided documents")) {
      return refusedResult(llmAnswer, "llm", superseded);
    }

    const audit = auditAnswerFaithfulness(
      llmAnswer,
      citations,
      documents,
      "llm",
    );

    if (!audit.faithful) {
      return groundedResult(
        buildExtractiveAnswer(citations, superseded),
        citations,
        "extractive",
        documents,
        superseded,
        audit.issues.map((issue) => `llm-rejected: ${issue}`),
      );
    }

    return groundedResult(
      appendSupersededFooter(llmAnswer, superseded),
      citations,
      "llm",
      documents,
      superseded,
    );
  }

  // 4) Default: extractive grounded answer + explicit superseded notes.
  return groundedResult(
    buildExtractiveAnswer(citations, superseded),
    citations,
    "extractive",
    documents,
    superseded,
  );
}
