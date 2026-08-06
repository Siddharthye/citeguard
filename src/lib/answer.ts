import { auditAnswerFaithfulness } from "./faithfulness";
import { REFUSAL_THRESHOLD, scoreChunks, toCitations } from "./retrieve";
import type { AskResult, Chunk, Citation, DocumentRecord } from "./types";

export const REFUSAL =
  "I don't know based on the provided documents. No passage was relevant enough to cite.";

function buildExtractiveAnswer(citations: Citation[]): string {
  if (citations.length === 1) {
    return `According to ${citations[0].documentName}: ${citations[0].quote}`;
  }

  const parts = citations.map(
    (citation, index) =>
      `(${index + 1}) From ${citation.documentName}: ${citation.quote}`,
  );
  return `Based on the provided documents:\n\n${parts.join("\n\n")}`;
}

function detectMultiSource(citations: Citation[]): boolean {
  const ids = new Set(citations.map((citation) => citation.documentId));
  return ids.size > 1;
}

function refusedResult(
  answer: string,
  mode: AskResult["mode"],
): AskResult {
  return {
    answer,
    refused: true,
    citations: [],
    mode,
    faithful: true,
    auditIssues: [],
    multiSource: false,
  };
}

function groundedResult(
  answer: string,
  citations: Citation[],
  mode: AskResult["mode"],
  documents: DocumentRecord[],
  extraIssues: string[] = [],
): AskResult {
  const audit = auditAnswerFaithfulness(answer, citations, documents, mode);
  return {
    answer,
    refused: false,
    citations,
    mode,
    faithful: audit.faithful,
    auditIssues: [...extraIssues, ...audit.issues],
    multiSource: detectMultiSource(citations),
  };
}

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
    return refusedResult(REFUSAL, "extractive");
  }

  const citations = toCitations(scored, 3);
  const llmAnswer = await maybeRefineWithLlm(question, citations);

  if (llmAnswer) {
    if (llmAnswer.includes("I don't know based on the provided documents")) {
      return refusedResult(llmAnswer, "llm");
    }

    const audit = auditAnswerFaithfulness(
      llmAnswer,
      citations,
      documents,
      "llm",
    );

    if (!audit.faithful) {
      // Citation Auditor veto: fall back to extractive grounded answer.
      return groundedResult(
        buildExtractiveAnswer(citations),
        citations,
        "extractive",
        documents,
        audit.issues.map((issue) => `llm-rejected: ${issue}`),
      );
    }

    return groundedResult(llmAnswer, citations, "llm", documents);
  }

  return groundedResult(
    buildExtractiveAnswer(citations),
    citations,
    "extractive",
    documents,
  );
}
