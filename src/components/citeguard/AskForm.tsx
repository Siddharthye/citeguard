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
    shortLabel: "Leave days",
    question: "How many days of paid annual leave do employees receive?",
  },
  {
    id: "pizza",
    label: "Cafeteria pizza (refuse)",
    shortLabel: "Pizza (refuse)",
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
      <label className="label-caps" htmlFor="question-input">
        Question
      </label>
      <textarea
        id="question-input"
        data-testid="question-input"
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        rows={4}
        placeholder="How many paid leave days do employees get?"
        className="field resize-y px-3.5 py-3 text-base placeholder:text-[var(--ink-faint)] sm:px-4 sm:py-3.5"
        required
        minLength={3}
        enterKeyHint="send"
        autoComplete="off"
      />

      <div className="space-y-2" data-testid="try-questions">
        <p className="text-xs text-[var(--ink-faint)]">Try a demo:</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {TRY_QUESTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid={`try-${item.id}`}
              disabled={busy}
              onClick={() => onQuestionChange(item.question)}
              className="btn-secondary w-full touch-manipulation !min-h-11 !px-3 !py-2.5 text-sm sm:w-auto"
            >
              <span className="sm:hidden">{item.shortLabel}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
          {onLoadDay2Demo && (
            <button
              type="button"
              data-testid="try-day2-supersession"
              disabled={busy}
              onClick={() => void onLoadDay2Demo()}
              className="btn-secondary w-full touch-manipulation !min-h-11 !px-3 !py-2.5 text-sm sm:w-auto"
            >
              <span className="sm:hidden">Day 2: supersession</span>
              <span className="hidden sm:inline">Day 2: superseded policies</span>
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        data-testid="ask-button"
        disabled={busy}
        className={`btn-primary touch-manipulation${busy ? " btn-busy" : ""}`}
        aria-busy={busy}
      >
        {busy ? "Checking sources…" : "Ask with citations"}
      </button>
    </form>
  );
}
