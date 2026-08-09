/**
 * Chunk-and-index primitives (skill: skills/chunk-and-index/SKILL.md).
 *
 * - tokenize: stopword-aware terms for retrieval scoring
 * - chunkText: overlapping windows with stable `${documentId}-${index}` ids
 */
import type { Chunk } from "./types";

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "as",
  "by",
  "with",
  "from",
  "about",
  "into",
  "over",
  "after",
  "before",
  "between",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "you",
  "your",
  "we",
  "our",
  "they",
  "their",
  "what",
  "which",
  "who",
  "whom",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

/** Split text into overlapping chunks for retrieval. */
export function chunkText(
  text: string,
  documentId: string,
  documentName: string,
  size = 500,
  overlap = 80,
): Chunk[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < normalized.length) {
    let end = Math.min(start + size, normalized.length);

    if (end < normalized.length) {
      const slice = normalized.slice(start, end);
      const lastBreak = Math.max(
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf("\n"),
      );
      if (lastBreak > size * 0.4) {
        end = start + lastBreak + 1;
      }
    }

    const chunkTextValue = normalized.slice(start, end).trim();
    if (chunkTextValue) {
      chunks.push({
        id: `${documentId}-${index}`,
        documentId,
        documentName,
        index,
        text: chunkTextValue,
      });
      index += 1;
    }

    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}
