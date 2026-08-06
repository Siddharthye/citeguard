/** Mark the cited span with ⟦ … ⟧ for the source panel. */
export function highlightContent(content: string, quote: string): string {
  const core = quote.replace(/\.\.\.$/, "").trim();
  if (!core) return content;
  const idx = content.toLowerCase().indexOf(core.toLowerCase());
  if (idx < 0) return content;
  const before = content.slice(0, idx);
  const match = content.slice(idx, idx + core.length);
  const after = content.slice(idx + core.length);
  return `${before}⟦${match}⟧${after}`;
}
