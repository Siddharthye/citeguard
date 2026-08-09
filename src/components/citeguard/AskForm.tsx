type AskFormProps = {
  question: string;
  busy: boolean;
  onQuestionChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onLoadDay2Demo?: () => void | Promise<void>;
};

const TRY_QUESTIONS = [
  {
    id: "leave",
    label: "Paid leave days",
    question: "How many days of paid annual leave do employees receive?",
  },
  {
    id: "pizza",
    label: "Cafeteria pizza (refuse)",
    question: "What is the cafeteria pizza topping?",
  },
] as const;

export function AskForm({
  question,
  busy,
  onQuestionChange,
  onSubmit,
  onLoadDay2Demo,
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
      <div className="flex flex-wrap gap-2" data-testid="try-questions">
        <span className="w-full text-xs text-[var(--ink-faint)] sm:w-auto sm:self-center">
          Try:
        </span>
        {TRY_QUESTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`try-${item.id}`}
            disabled={busy}
            onClick={() => onQuestionChange(item.question)}
            className="btn-secondary px-3 py-1.5 text-sm"
          >
            {item.label}
          </button>
        ))}
        {onLoadDay2Demo && (
          <button
            type="button"
            data-testid="try-day2-supersession"
            disabled={busy}
            onClick={() => void onLoadDay2Demo()}
            className="btn-secondary px-3 py-1.5 text-sm"
          >
            Day 2: superseded policies
          </button>
        )}
      </div>
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
