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
      className="glass space-y-5 p-6 sm:p-7"
      data-testid="ask-form"
    >
      <label className="label-caps">Question</label>
      <textarea
        data-testid="question-input"
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        rows={4}
        placeholder="How many paid leave days do employees get?"
        className="field resize-y px-4 py-3.5 text-base placeholder:text-[var(--ink-faint)]"
        required
        minLength={3}
      />
      <button
        type="submit"
        data-testid="ask-button"
        disabled={busy}
        className={`btn-primary ${busy ? "btn-busy" : ""}`}
        aria-busy={busy}
      >
        {busy ? "Checking sources" : "Ask with citations"}
      </button>
    </form>
  );
}
