import { highlightContent } from "./highlight";
import type { SourceView } from "./types";

type SourcePanelProps = {
  source: SourceView;
  onClose: () => void;
};

export function SourcePanel({ source, onClose }: SourcePanelProps) {
  return (
    <section
      id="source-panel"
      data-testid="source-panel"
      className="space-y-3 border border-[var(--line)] bg-white/70 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-[var(--ink)]">
          Source: {source.name}
        </h2>
        <button
          type="button"
          className="text-sm text-[var(--ink-muted)] underline"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <p className="text-sm text-[var(--ink-muted)]">
        Cited span marked with ⟦ … ⟧
      </p>
      <pre
        data-testid="source-content"
        className="max-h-80 overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]"
      >
        {highlightContent(source.content, source.highlight)}
      </pre>
    </section>
  );
}
