type AskFormProps = {
  question: string;
  busy: boolean;
  onQuestionChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export function AskForm({
  question,
  busy,
  onQuestionChange,
  onSubmit,
}: AskFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" data-testid="ask-form">
      <label className="block text-sm font-medium uppercase tracking-[0.14em] text-[var(--teal)]">
        Question
      </label>
      <textarea
        data-testid="question-input"
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        rows={4}
        placeholder="How many paid leave days do employees get?"
        className="w-full resize-y rounded-sm border border-[var(--line)] bg-white/80 px-4 py-3 text-base text-[var(--ink)] outline-none ring-[var(--teal)] placeholder:text-[var(--ink-faint)] focus:ring-2"
        required
        minLength={3}
      />
      <button
        type="submit"
        data-testid="ask-button"
        disabled={busy}
        className="bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--teal-deep)] disabled:opacity-50"
      >
        {busy ? "Checking sources…" : "Ask with citations"}
      </button>
    </form>
  );
}
