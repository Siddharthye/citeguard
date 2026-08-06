import type { AuditEntry } from "./types";

type AuditPanelProps = {
  audit: AuditEntry[];
};

export function AuditPanel({ audit }: AuditPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl text-[var(--ink)]">Audit log</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Every question is logged with refusal status and citation count.
          </p>
        </div>
        <a
          href="/api/audit?format=csv"
          data-testid="export-audit"
          className="border border-[var(--ink)] px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
        >
          Export CSV
        </a>
      </div>
      <ul className="space-y-3" data-testid="audit-list">
        {audit.length === 0 && (
          <li className="text-sm text-[var(--ink-faint)]">No questions yet.</li>
        )}
        {audit.map((entry) => (
          <li
            key={entry.id}
            className="border border-[var(--line)] bg-white/60 p-3 text-sm"
          >
            <p className="font-medium text-[var(--ink)]">{entry.question}</p>
            <p className="mt-1 text-[var(--ink-muted)]">
              {entry.refused ? "Refused" : "Answered"} · {entry.citationCount}{" "}
              citation{entry.citationCount === 1 ? "" : "s"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
