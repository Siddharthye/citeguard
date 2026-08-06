import type { AskResult, Citation } from "./types";

type AnswerPanelProps = {
  result: AskResult | null;
  onOpenCitation: (citation: Citation) => void;
};

export function AnswerPanel({ result, onOpenCitation }: AnswerPanelProps) {
  return (
    <div
      className="glass space-y-4 p-4 sm:p-7"
      data-testid="answer-panel"
    >
      <p className="label-caps">Answer</p>
      {result ? (
        <div
          key={`${result.refused}-${result.answer.slice(0, 48)}`}
          className={`space-y-4 border-l-[3px] pl-3 sm:pl-4 ${
            result.refused ? "border-[var(--warn)]" : "border-[var(--teal)]"
          }`}
        >
          <p
            data-testid="answer-text"
            className="break-safe whitespace-pre-wrap text-base leading-relaxed text-[var(--ink)] sm:text-[1.05rem]"
          >
            {result.answer}
          </p>

          {result.multiSource && !result.refused && (
            <div
              data-testid="conflict-banner"
              className="rounded-[var(--radius-sm)] border border-[var(--warn)]/40 bg-[var(--warn-soft)] px-3 py-3 text-sm text-[var(--ink)] sm:px-3.5"
              role="status"
            >
              <p className="font-semibold text-[var(--warn)]">
                Multiple sources disagree — see both
              </p>
              <p className="mt-1 break-safe text-[var(--ink-muted)]">
                Citations span{" "}
                {[
                  ...new Set(
                    result.citations.map((citation) => citation.documentName),
                  ),
                ].join(" · ")}
                . Compare quotes before treating any single figure as policy.
              </p>
            </div>
          )}

          <p
            className="text-xs font-medium tracking-wide text-[var(--ink-faint)]"
            data-testid="answer-meta"
          >
            Mode: {result.mode}
            {result.refused ? " · refused" : ""}
            {result.faithful ? " · auditor: pass" : " · auditor: fail"}
            {result.multiSource ? " · multi-source" : ""}
          </p>

          {result.auditIssues.length > 0 && (
            <ul className="break-safe text-xs text-[var(--warn)]" data-testid="audit-issues">
              {result.auditIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}

          {result.citations.length > 0 && (
            <ul className="space-y-3" data-testid="citations">
              {result.citations.map((citation) => (
                <li key={`${citation.documentId}-${citation.chunkIndex}`}>
                  <button
                    type="button"
                    data-testid="citation-button"
                    onClick={() => onOpenCitation(citation)}
                    className="glass-inset min-h-11 w-full p-3.5 text-left text-sm leading-relaxed text-[var(--ink-muted)]"
                  >
                    <span className="break-safe font-semibold text-[var(--ink)]">
                      {citation.documentName}
                    </span>
                    <span className="block text-[var(--ink-faint)] sm:inline">
                      {" "}
                      · chunk {citation.chunkIndex + 1} · score{" "}
                      {citation.score.toFixed(2)} · view source
                    </span>
                    <p className="mt-2 break-safe border-l-2 border-[var(--teal)]/35 pl-3 italic text-[var(--ink-muted)]">
                      “{citation.quote}”
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--ink-faint)] sm:text-base">
          Answers appear here with source quotes. Out-of-scope questions are
          refused.
        </p>
      )}
    </div>
  );
}
