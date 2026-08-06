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
    <form
      onSubmit={onSubmit}
      className="glass space-y-4 p-4 sm:space-y-5 sm:p-7"
      data-testid="ask-form"
    >
      <label className="label-caps">Question</label>
      <textarea
        data-testid="question-input"
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        rows={4}
        placeholder="How many paid leave days do employees get?"
        className="field resize-y px-3.5 py-3 placeholder:text-[var(--ink-faint)] sm:px-4 sm:py-3.5"
        required
        minLength={3}
        enterKeyHint="send"
        autoComplete="off"
      />
      <button
        type="submit"
        data-testid="ask-button"
        disabled={busy}
        className={`btn-primary${busy ? " btn-busy" : ""}`}
        aria-busy={busy}
      >
        {busy ? "Checking sources…" : "Ask with citations"}
      </button>
    </form>
  );
}
