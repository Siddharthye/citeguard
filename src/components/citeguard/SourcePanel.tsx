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
      className="glass-strong anim-slide-up space-y-4 p-6 sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-[var(--ink)] sm:text-3xl">
          Source: {source.name}
        </h2>
        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="anim-pop text-sm text-[var(--ink-muted)]">
        Cited span marked with ⟦ … ⟧
      </p>
      <pre
        data-testid="source-content"
        className="glass-inset anim-pop max-h-80 overflow-auto p-4 text-sm leading-relaxed text-[var(--ink)]"
        style={{ animationDelay: "0.1s" }}
      >
        {highlightContent(source.content, source.highlight)}
      </pre>
    </section>
  );
}
