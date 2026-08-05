"use client";

import { useCallback, useState } from "react";

type DocumentRecord = {
  id: string;
  name: string;
  uploadedAt: string;
};

type Citation = {
  documentName: string;
  chunkIndex: number;
  quote: string;
  score: number;
};

type AskResult = {
  answer: string;
  refused: boolean;
  citations: Citation[];
  mode: "extractive" | "llm";
};

type AuditEntry = {
  id: string;
  question: string;
  answer: string;
  refused: boolean;
  citationCount: number;
  createdAt: string;
};

type CiteGuardAppProps = {
  initialDocuments: DocumentRecord[];
  initialAudit: AuditEntry[];
};

export function CiteGuardApp({
  initialDocuments,
  initialAudit,
}: CiteGuardAppProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [audit, setAudit] = useState(initialAudit);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadContent, setUploadContent] = useState("");

  const refresh = useCallback(async () => {
    const [docsRes, auditRes] = await Promise.all([
      fetch("/api/documents"),
      fetch("/api/audit"),
    ]);
    const docsJson = await docsRes.json();
    const auditJson = await auditRes.json();
    setDocuments(docsJson.documents ?? []);
    setAudit(auditJson.entries ?? []);
  }, []);

  async function onAsk(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Ask failed");
      }
      setResult(data);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ask failed");
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uploadName || "uploaded-policy.txt",
          content: uploadContent,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Upload failed");
      }
      setUploadName("");
      setUploadContent("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setUploadName(file.name);
    setUploadContent(text);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-5 py-10 sm:px-8 sm:py-16">
      <header className="space-y-5">
        <p className="font-display text-5xl tracking-tight text-[var(--ink)] sm:text-7xl">
          CiteGuard
        </p>
        <h1 className="max-w-2xl text-xl font-medium leading-snug text-[var(--ink-muted)] sm:text-2xl">
          Ask policy questions. Get answers only when the documents support them —
          with the exact passage attached.
        </h1>
      </header>

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onAsk} className="space-y-4" data-testid="ask-form">
          <label className="block text-sm font-medium uppercase tracking-[0.14em] text-[var(--teal)]">
            Question
          </label>
          <textarea
            data-testid="question-input"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
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

        <div className="space-y-3" data-testid="answer-panel">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--teal)]">
            Answer
          </p>
          {result ? (
            <div
              className={`space-y-4 border-l-4 pl-4 ${
                result.refused
                  ? "border-[var(--warn)]"
                  : "border-[var(--teal)]"
              }`}
            >
              <p
                data-testid="answer-text"
                className="whitespace-pre-wrap text-base leading-relaxed text-[var(--ink)]"
              >
                {result.answer}
              </p>
              <p className="text-xs uppercase tracking-wider text-[var(--ink-faint)]">
                Mode: {result.mode}
                {result.refused ? " · refused" : ""}
              </p>
              {result.citations.length > 0 && (
                <ul className="space-y-3" data-testid="citations">
                  {result.citations.map((citation) => (
                    <li
                      key={`${citation.documentName}-${citation.chunkIndex}-${citation.score}`}
                      className="bg-white/70 p-3 text-sm leading-relaxed text-[var(--ink-muted)]"
                    >
                      <span className="font-semibold text-[var(--ink)]">
                        {citation.documentName}
                      </span>
                      <span className="text-[var(--ink-faint)]">
                        {" "}
                        · chunk {citation.chunkIndex + 1} · score{" "}
                        {citation.score.toFixed(2)}
                      </span>
                      <p className="mt-2 border-l-2 border-[var(--line)] pl-3 italic">
                        “{citation.quote}”
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-[var(--ink-faint)]">
              Answers appear here with source quotes. Out-of-scope questions are
              refused.
            </p>
          )}
        </div>
      </section>

      {error && (
        <p className="text-sm text-[var(--warn)]" role="alert">
          {error}
        </p>
      )}

      <section className="grid gap-10 border-t border-[var(--line)] pt-12 lg:grid-cols-2">
        <form onSubmit={onUpload} className="space-y-4" data-testid="upload-form">
          <h2 className="font-display text-3xl text-[var(--ink)]">Sources</h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Paste policy text or upload a{" "}
            <code className="text-[var(--teal-deep)]">.txt</code> /{" "}
            <code className="text-[var(--teal-deep)]">.md</code> file.
          </p>
          <input
            data-testid="file-input"
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-[var(--ink-muted)] file:mr-3 file:border-0 file:bg-[var(--ink)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--paper)]"
          />
          <input
            data-testid="upload-name"
            value={uploadName}
            onChange={(event) => setUploadName(event.target.value)}
            placeholder="Document name"
            className="w-full border border-[var(--line)] bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--teal)]"
          />
          <textarea
            data-testid="upload-content"
            value={uploadContent}
            onChange={(event) => setUploadContent(event.target.value)}
            rows={6}
            placeholder="Paste policy text…"
            className="w-full border border-[var(--line)] bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--teal)]"
            required
          />
          <button
            type="submit"
            data-testid="upload-button"
            disabled={busy}
            className="border border-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-50"
          >
            Add document
          </button>

          <ul className="space-y-2 pt-2" data-testid="document-list">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 text-sm text-[var(--ink-muted)]"
              >
                <span>{doc.name}</span>
                <time className="text-xs text-[var(--ink-faint)]">
                  {new Date(doc.uploadedAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        </form>

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
      </section>
    </div>
  );
}
