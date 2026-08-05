import { REFUSAL_THRESHOLD, scoreChunks, toCitations } from "./retrieve";
import type { AskResult, Chunk } from "./types";

const REFUSAL =
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
): Promise<AskResult> {
  const scored = scoreChunks(question, chunks);
  const best = scored[0]?.score ?? 0;

  if (best < REFUSAL_THRESHOLD) {
    return {
      answer: REFUSAL,
      refused: true,
      citations: [],
      mode: "extractive",
    };
  }

  const citations = toCitations(scored, 3);
  const llmAnswer = await maybeRefineWithLlm(question, citations);

  if (llmAnswer) {
    return {
      answer: llmAnswer,
      refused: llmAnswer.includes("I don't know based on the provided documents"),
      citations,
      mode: "llm",
    };
  }

  return {
    answer: buildExtractiveAnswer(citations),
    refused: false,
    citations,
    mode: "extractive",
  };
}
