import type { AskResult, Citation } from "./types";

type AnswerPanelProps = {
  result: AskResult | null;
  onOpenCitation: (citation: Citation) => void;
};

export function AnswerPanel({ result, onOpenCitation }: AnswerPanelProps) {
  return (
    <div className="glass space-y-4 p-6 sm:p-7" data-testid="answer-panel">
      <p className="label-caps">Answer</p>
      {result ? (
        <div
          key={`${result.refused}-${result.answer.slice(0, 48)}`}
          className={`answer-live space-y-4 border-l-[3px] pl-4 ${
            result.refused
              ? "border-[var(--warn)]"
              : "ok border-[var(--teal)]"
          }`}
        >
          <p
            data-testid="answer-text"
            className="whitespace-pre-wrap text-[1.05rem] leading-relaxed text-[var(--ink)]"
          >
            {result.answer}
          </p>

          {result.multiSource && !result.refused && (
            <div
              data-testid="conflict-banner"
              className="anim-pop rounded-[var(--radius-sm)] border border-[var(--warn)]/40 bg-[var(--warn-soft)] px-3.5 py-3 text-sm text-[var(--ink)] backdrop-blur-md"
              role="status"
            >
              <p className="font-semibold text-[var(--warn)]">
                Multiple sources disagree — see both
              </p>
              <p className="mt-1 text-[var(--ink-muted)]">
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
            className="anim-pop text-xs font-medium tracking-wide text-[var(--ink-faint)]"
            data-testid="answer-meta"
            style={{ animationDelay: "0.08s" }}
          >
            Mode: {result.mode}
            {result.refused ? " · refused" : ""}
            {result.faithful ? " · auditor: pass" : " · auditor: fail"}
            {result.multiSource ? " · multi-source" : ""}
          </p>

          {result.auditIssues.length > 0 && (
            <ul className="anim-stagger text-xs text-[var(--warn)]" data-testid="audit-issues">
              {result.auditIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}

          {result.citations.length > 0 && (
            <ul className="anim-stagger space-y-3" data-testid="citations">
              {result.citations.map((citation) => (
                <li key={`${citation.documentId}-${citation.chunkIndex}`}>
                  <button
                    type="button"
                    data-testid="citation-button"
                    onClick={() => onOpenCitation(citation)}
                    className="glass-inset w-full p-3.5 text-left text-sm leading-relaxed text-[var(--ink-muted)]"
                  >
                    <span className="font-semibold text-[var(--ink)]">
                      {citation.documentName}
                    </span>
                    <span className="text-[var(--ink-faint)]">
                      {" "}
                      · chunk {citation.chunkIndex + 1} · score{" "}
                      {citation.score.toFixed(2)} · view source
                    </span>
                    <p className="mt-2 border-l-2 border-[var(--teal)]/35 pl-3 italic text-[var(--ink-muted)]">
                      “{citation.quote}”
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="placeholder-pulse text-[var(--ink-faint)]">
          Answers appear here with source quotes. Out-of-scope questions are
          refused.
        </p>
      )}
    </div>
  );
}
