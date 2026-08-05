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

/**
 * Prefer diverse documents when several sources clear the threshold,
 * so multi-policy conflicts surface in the UI instead of one handbook dominating.
 */
export function toCitations(
  scored: ScoredChunk[],
  limit = 3,
  minScore = REFUSAL_THRESHOLD,
): Citation[] {
  const eligible = scored.filter((item) => item.score >= minScore);
  const selected: ScoredChunk[] = [];
  const seenDocs = new Set<string>();

  for (const item of eligible) {
    if (seenDocs.has(item.chunk.documentId)) continue;
    selected.push(item);
    seenDocs.add(item.chunk.documentId);
    if (selected.length >= limit) break;
  }

  for (const item of eligible) {
    if (selected.length >= limit) break;
    if (selected.some((s) => s.chunk.id === item.chunk.id)) continue;
    selected.push(item);
  }

  if (selected.length === 0) {
    return scored.slice(0, limit).map(scoredToCitation);
  }

  return selected.map(scoredToCitation);
}

function scoredToCitation({ chunk, score }: ScoredChunk): Citation {
  return {
    documentId: chunk.documentId,
    documentName: chunk.documentName,
    chunkId: chunk.id,
    chunkIndex: chunk.index,
    quote: chunk.text.length > 320 ? `${chunk.text.slice(0, 317)}...` : chunk.text,
    score: Number(score.toFixed(4)),
  };
}

/** Minimum best-chunk score required to answer (else refuse). */
export const REFUSAL_THRESHOLD = 0.18;
