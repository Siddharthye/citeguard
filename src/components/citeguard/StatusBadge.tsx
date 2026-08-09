type StatusBadgeProps = {
  kind: "current" | "superseded";
  testId: string;
};

export function StatusBadge({ kind, testId }: StatusBadgeProps) {
  const isSuperseded = kind === "superseded";
  return (
    <span
      data-testid={testId}
      className={
        isSuperseded
          ? "inline-flex shrink-0 items-center rounded-md bg-[var(--warn-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--warn)]"
          : "inline-flex shrink-0 items-center rounded-md bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]"
      }
    >
      {kind}
    </span>
  );
}
