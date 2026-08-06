"use client";

import { useCallback, useState } from "react";
import { AnswerPanel } from "./citeguard/AnswerPanel";
import { AskForm } from "./citeguard/AskForm";
import { AuditPanel } from "./citeguard/AuditPanel";
import { SourcePanel } from "./citeguard/SourcePanel";
import { SourcesPanel } from "./citeguard/SourcesPanel";
import type {
  AskResult,
  AuditEntry,
  Citation,
  DocumentSummary,
  SourceView,
} from "./citeguard/types";

type CiteGuardAppProps = {
  initialDocuments: DocumentSummary[];
  initialAudit: AuditEntry[];
};

function scrollToSourcePanel() {
  requestAnimationFrame(() => {
    document.getElementById("source-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
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
        scrollToSourcePanel();
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
    scrollToSourcePanel();
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
      const message = err instanceof Error ? err.message : "Ask failed";
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
        <AskForm
          question={question}
          busy={busy}
          onQuestionChange={setQuestion}
          onSubmit={(event) => void onAsk(event)}
        />
        <AnswerPanel
          result={result}
          onOpenCitation={(citation) => void openCitation(citation)}
        />
      </section>

      {sourceView && (
        <SourcePanel source={sourceView} onClose={() => setSourceView(null)} />
      )}

      {error && (
        <p className="text-sm text-[var(--warn)]" role="alert">
          {error}
        </p>
      )}

      <section className="grid gap-10 border-t border-[var(--line)] pt-12 lg:grid-cols-2">
        <SourcesPanel
          documents={documents}
          busy={busy}
          uploadName={uploadName}
          uploadContent={uploadContent}
          onUploadNameChange={setUploadName}
          onUploadContentChange={setUploadContent}
          onFile={(file) => void onFile(file)}
          onSubmit={(event) => void onUpload(event)}
        />
        <AuditPanel audit={audit} />
      </section>
    </div>
  );
}
