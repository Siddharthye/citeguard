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
      className="glass-strong space-y-4 p-4 sm:p-7"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display break-safe text-xl text-[var(--ink)] sm:text-3xl">
          Source: {source.name}
        </h2>
        <button
          type="button"
          className="btn-secondary min-h-11 w-full touch-manipulation sm:w-auto"
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
        className="glass-inset max-h-[50vh] overflow-auto p-3 text-sm leading-relaxed break-safe whitespace-pre-wrap text-[var(--ink)] sm:max-h-80 sm:p-4"
      >
        {highlightContent(source.content, source.highlight)}
      </pre>
    </section>
  );
}
