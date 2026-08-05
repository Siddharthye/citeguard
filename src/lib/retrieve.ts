import { tokenize } from "./chunk";
import type { Chunk, Citation } from "./types";

export type ScoredChunk = {
  chunk: Chunk;
  score: number;
};

/** Score chunks by overlapping query terms (TF-style). */
export function scoreChunks(question: string, chunks: Chunk[]): ScoredChunk[] {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0 || chunks.length === 0) return [];

  const querySet = new Set(queryTokens);

  return chunks
    .map((chunk) => {
      const tokens = tokenize(chunk.text);
      if (tokens.length === 0) return { chunk, score: 0 };

      const counts = new Map<string, number>();
      for (const token of tokens) {
        counts.set(token, (counts.get(token) ?? 0) + 1);
      }

      let overlap = 0;
      let weight = 0;
      for (const token of querySet) {
        const count = counts.get(token) ?? 0;
        if (count > 0) {
          overlap += 1;
          weight += Math.log(1 + count);
        }
      }

      const coverage = overlap / querySet.size;
      const score = coverage * 0.65 + (weight / querySet.size) * 0.35;
      return { chunk, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function toCitations(scored: ScoredChunk[], limit = 3): Citation[] {
  return scored.slice(0, limit).map(({ chunk, score }) => ({
    documentId: chunk.documentId,
    documentName: chunk.documentName,
    chunkId: chunk.id,
    chunkIndex: chunk.index,
    quote: chunk.text.length > 320 ? `${chunk.text.slice(0, 317)}...` : chunk.text,
    score: Number(score.toFixed(4)),
  }));
}

/** Minimum best-chunk score required to answer (else refuse). */
export const REFUSAL_THRESHOLD = 0.18;
