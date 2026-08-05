import { auditAnswerFaithfulness } from "./faithfulness";
import { REFUSAL_THRESHOLD, scoreChunks, toCitations } from "./retrieve";
import type { AskResult, Chunk, DocumentRecord } from "./types";

export const REFUSAL =
  "I don't know based on the provided documents. No passage was relevant enough to cite.";

function buildExtractiveAnswer(citations: AskResult["citations"]): string {
  if (citations.length === 1) {
    return `According to ${citations[0].documentName}: ${citations[0].quote}`;
  }

  const parts = citations.map(
    (citation, index) =>
      `(${index + 1}) From ${citation.documentName}: ${citation.quote}`,
  );
  return `Based on the provided documents:\n\n${parts.join("\n\n")}`;
}

function detectMultiSource(citations: AskResult["citations"]): boolean {
  const ids = new Set(citations.map((citation) => citation.documentId));
  return ids.size > 1;
}

async function maybeRefineWithLlm(
  question: string,
  citations: AskResult["citations"],
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
Do not invent policies, numbers, or procedures.`;

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
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch {
    return null;
  }
}

export async function answerQuestion(
  question: string,
  chunks: Chunk[],
  documents: DocumentRecord[] = [],
): Promise<AskResult> {
  const scored = scoreChunks(question, chunks);
  const best = scored[0]?.score ?? 0;

  if (best < REFUSAL_THRESHOLD) {
    return {
      answer: REFUSAL,
      refused: true,
      citations: [],
      mode: "extractive",
      faithful: true,
      auditIssues: [],
      multiSource: false,
    };
  }

  const citations = toCitations(scored, 3);
  const multiSource = detectMultiSource(citations);
  const llmAnswer = await maybeRefineWithLlm(question, citations);

  if (llmAnswer) {
    const refused = llmAnswer.includes(
      "I don't know based on the provided documents",
    );
    if (refused) {
      return {
        answer: llmAnswer,
        refused: true,
        citations: [],
        mode: "llm",
        faithful: true,
        auditIssues: [],
        multiSource: false,
      };
    }

    const audit = auditAnswerFaithfulness(
      llmAnswer,
      citations,
      documents,
      "llm",
    );

    if (!audit.faithful) {
      // Citation Auditor veto: fall back to extractive grounded answer.
      const extractive = buildExtractiveAnswer(citations);
      const extractiveAudit = auditAnswerFaithfulness(
        extractive,
        citations,
        documents,
        "extractive",
      );
      return {
        answer: extractive,
        refused: false,
        citations,
        mode: "extractive",
        faithful: extractiveAudit.faithful,
        auditIssues: [
          ...audit.issues.map((issue) => `llm-rejected: ${issue}`),
          ...extractiveAudit.issues,
        ],
        multiSource,
      };
    }

    return {
      answer: llmAnswer,
      refused: false,
      citations,
      mode: "llm",
      faithful: true,
      auditIssues: [],
      multiSource,
    };
  }

  const answer = buildExtractiveAnswer(citations);
  const audit = auditAnswerFaithfulness(
    answer,
    citations,
    documents,
    "extractive",
  );

  return {
    answer,
    refused: false,
    citations,
    mode: "extractive",
    faithful: audit.faithful,
    auditIssues: audit.issues,
    multiSource,
  };
}
