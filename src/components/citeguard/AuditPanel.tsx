import type { AuditEntry } from "./types";

type AuditPanelProps = {
  audit: AuditEntry[];
};

export function AuditPanel({ audit }: AuditPanelProps) {
  return (
    <div className="glass space-y-4 p-4 sm:space-y-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-[var(--ink)] sm:text-3xl">Audit log</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Every question is logged with refusal status and citation count.
          </p>
        </div>
        <a
          href="/api/audit?format=csv"
          data-testid="export-audit"
          className="btn-secondary w-full text-center sm:w-auto"
        >
          Export CSV
        </a>
      </div>
      <ul className="space-y-3" data-testid="audit-list">
        {audit.length === 0 && (
          <li className="text-sm text-[var(--ink-faint)]">No questions yet.</li>
        )}
        {audit.map((entry) => (
          <li key={entry.id} className="glass-inset p-3.5 text-sm">
            <p className="break-safe font-medium text-[var(--ink)]">{entry.question}</p>
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
