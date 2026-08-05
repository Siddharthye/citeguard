"use client";

import { useCallback, useState } from "react";

type DocumentRecord = {
  id: string;
  name: string;
  uploadedAt: string;
};

type Citation = {
  documentId: string;
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
  faithful: boolean;
  auditIssues: string[];
  multiSource: boolean;
};

type AuditEntry = {
  id: string;
  question: string;
  answer: string;
  refused: boolean;
  citationCount: number;
  createdAt: string;
};

type SourceView = {
  id: string;
  name: string;
  content: string;
  highlight: string;
};

type CiteGuardAppProps = {
  initialDocuments: DocumentRecord[];
  initialAudit: AuditEntry[];
};

function highlightContent(content: string, quote: string): string {
  const core = quote.replace(/\.\.\.$/, "").trim();
  if (!core) return content;
  const idx = content.toLowerCase().indexOf(core.toLowerCase());
  if (idx < 0) return content;
  const before = content.slice(0, idx);
  const match = content.slice(idx, idx + core.length);
  const after = content.slice(idx + core.length);
  return `${before}⟦${match}⟧${after}`;
}

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
  const [sourceView, setSourceView] = useState<SourceView | null>(null);

  const refresh = useCallback(async () => {
    const [docsRes, auditRes] = await Promise.all([
      fetch("/api/documents", { cache: "no-store" }),
      fetch("/api/audit", { cache: "no-store" }),
    ]);
    if (!docsRes.ok || !auditRes.ok) {
      throw new Error("Could not refresh documents or audit log.");
    }
    const docsJson = await docsRes.json();
    const auditJson = await auditRes.json();
    setDocuments(docsJson.documents ?? []);
    setAudit(auditJson.entries ?? []);
  }, []);

  async function openCitation(citation: Citation) {
    // Prefer live document body; fall back to the citation quote if the
    // serverless instance does not share uploaded-doc memory.
    try {
      const response = await fetch(
        `/api/documents?id=${encodeURIComponent(citation.documentId)}`,
        { cache: "no-store" },
      );
      if (response.ok) {
        const data = await response.json();
        setSourceView({
          id: data.document.id,
          name: data.document.name,
          content: data.document.content,
          highlight: citation.quote,
        });
        requestAnimationFrame(() => {
          document.getElementById("source-panel")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
        return;
      }
    } catch {
      // fall through to quote-only view
    }

    setSourceView({
      id: citation.documentId,
      name: citation.documentName,
      content: citation.quote,
      highlight: citation.quote,
    });
    requestAnimationFrame(() => {
      document.getElementById("source-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function onAsk(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          (data as { error?: string }).error ??
            `Ask failed (HTTP ${response.status})`,
        );
      }
      setResult(data as AskResult);
      try {
        await refresh();
      } catch {
        // Answer already shown; list refresh is best-effort on serverless.
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ask failed";
      setError(
        message === "Failed to fetch" || message.includes("NetworkError")
          ? "Network error reaching the API. Retry once — cold starts on free hosting can drop the first request."
          : message,
      );
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
    setUploadName(file.name);
    setError(null);

    if (file.name.toLowerCase().endsWith(".pdf")) {
      setBusy(true);
      try {
        const form = new FormData();
        form.set("file", file);
        form.set("name", file.name);
        const response = await fetch("/api/documents", {
          method: "POST",
          body: form,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "PDF upload failed");
        }
        setUploadContent("");
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "PDF upload failed");
      } finally {
        setBusy(false);
      }
      return;
    }

    const text = await file.text();
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
              {result.multiSource && !result.refused && (
                <div
                  data-testid="conflict-banner"
                  className="border border-[var(--warn)] bg-[#fff7ed] px-3 py-2 text-sm text-[var(--ink)]"
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
                className="text-xs uppercase tracking-wider text-[var(--ink-faint)]"
                data-testid="answer-meta"
              >
                Mode: {result.mode}
                {result.refused ? " · refused" : ""}
                {result.faithful ? " · auditor: pass" : " · auditor: fail"}
                {result.multiSource ? " · multi-source" : ""}
              </p>
              {result.auditIssues.length > 0 && (
                <ul
                  className="text-xs text-[var(--warn)]"
                  data-testid="audit-issues"
                >
                  {result.auditIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
              {result.citations.length > 0 && (
                <ul className="space-y-3" data-testid="citations">
                  {result.citations.map((citation) => (
                    <li key={`${citation.documentId}-${citation.chunkIndex}`}>
                      <button
                        type="button"
                        data-testid="citation-button"
                        onClick={() => void openCitation(citation)}
                        className="w-full bg-white/70 p-3 text-left text-sm leading-relaxed text-[var(--ink-muted)] transition hover:bg-white"
                      >
                        <span className="font-semibold text-[var(--ink)]">
                          {citation.documentName}
                        </span>
                        <span className="text-[var(--ink-faint)]">
                          {" "}
                          · chunk {citation.chunkIndex + 1} · score{" "}
                          {citation.score.toFixed(2)} · view source
                        </span>
                        <p className="mt-2 border-l-2 border-[var(--line)] pl-3 italic">
                          “{citation.quote}”
                        </p>
                      </button>
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

      {sourceView && (
        <section
          id="source-panel"
          data-testid="source-panel"
          className="space-y-3 border border-[var(--line)] bg-white/70 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-[var(--ink)]">
              Source: {sourceView.name}
            </h2>
            <button
              type="button"
              className="text-sm text-[var(--ink-muted)] underline"
              onClick={() => setSourceView(null)}
            >
              Close
            </button>
          </div>
          <p className="text-sm text-[var(--ink-muted)]">
            Cited span marked with ⟦ … ⟧
          </p>
          <pre
            data-testid="source-content"
            className="max-h-80 overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]"
          >
            {highlightContent(sourceView.content, sourceView.highlight)}
          </pre>
        </section>
      )}

      {error && (
        <p className="text-sm text-[var(--warn)]" role="alert">
          {error}
        </p>
      )}

      <section className="grid gap-10 border-t border-[var(--line)] pt-12 lg:grid-cols-2">
        <form onSubmit={onUpload} className="space-y-4" data-testid="upload-form">
          <h2 className="font-display text-3xl text-[var(--ink)]">Sources</h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Paste policy text or upload{" "}
            <code className="text-[var(--teal-deep)]">.txt</code> /{" "}
            <code className="text-[var(--teal-deep)]">.md</code> /{" "}
            <code className="text-[var(--teal-deep)]">.pdf</code>.
          </p>
          <input
            data-testid="file-input"
            type="file"
            accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
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
            placeholder="Paste policy text (not needed for PDF — upload file directly)…"
            className="w-full border border-[var(--line)] bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--teal)]"
            required
          />
          <button
            type="submit"
            data-testid="upload-button"
            disabled={busy}
            className="border border-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-50"
          >
            Add pasted document
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
