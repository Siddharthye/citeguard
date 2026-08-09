"use client";

/**
 * CiteGuard shell: owns UI state and talks to the API.
 * Panels stay presentational — keep fetch/error logic here (or in http.ts).
 */
import { useCallback, useState } from "react";
import { AnswerPanel } from "./citeguard/AnswerPanel";
import { AskForm } from "./citeguard/AskForm";
import { AuditPanel } from "./citeguard/AuditPanel";
import { errorMessage, networkHint, readJson } from "./citeguard/http";
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

const LEAVE_QUESTION =
  "How many days of paid annual leave do employees receive?";

function scrollToSourcePanel() {
  requestAnimationFrame(() => {
    document.getElementById("source-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
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
  const [uploadEffectiveDate, setUploadEffectiveDate] = useState(todayIsoDate);
  const [uploadVersion, setUploadVersion] = useState("");
  const [uploadPolicyFamily, setUploadPolicyFamily] = useState("");
  const [sourceView, setSourceView] = useState<SourceView | null>(null);

  const refresh = useCallback(async () => {
    const [docsRes, auditRes] = await Promise.all([
      fetch("/api/documents", { cache: "no-store" }),
      fetch("/api/audit", { cache: "no-store" }),
    ]);
    if (!docsRes.ok || !auditRes.ok) {
      throw new Error("Could not refresh documents or audit log.");
    }
    const docsJson = (await readJson(docsRes)) as {
      documents?: DocumentSummary[];
    };
    const auditJson = (await readJson(auditRes)) as { entries?: AuditEntry[] };
    setDocuments(docsJson.documents ?? []);
    setAudit(auditJson.entries ?? []);
  }, []);

  function resetUploadFields() {
    setUploadName("");
    setUploadContent("");
    setUploadVersion("");
    setUploadPolicyFamily("");
  }

  async function openCitation(citation: Citation) {
    // Prefer full document body; fall back to quote if another serverless
    // instance does not share uploaded-doc memory.
    try {
      const response = await fetch(
        `/api/documents?id=${encodeURIComponent(citation.documentId)}`,
        { cache: "no-store" },
      );
      if (response.ok) {
        const data = (await readJson(response)) as {
          document: { id: string; name: string; content: string };
        };
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
      // use quote-only fallback below
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
    setSourceView(null);
    setResult(null);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        cache: "no-store",
      });
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(
          errorMessage(data, `Ask failed (HTTP ${response.status})`),
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
      setError(networkHint(message));
    } finally {
      setBusy(false);
    }
  }

  function onQuestionChange(value: string) {
    setQuestion(value);
    setSourceView(null);
  }

  /** Seeds old+new leave policies and returns the answered AskResult. */
  async function onLoadDay2Demo() {
    setBusy(true);
    setError(null);
    setSourceView(null);
    setResult(null);
    try {
      const response = await fetch("/api/demo/day2-supersession", {
        method: "POST",
        cache: "no-store",
      });
      const data = (await readJson(response)) as {
        error?: string;
        question?: string;
        result?: AskResult;
      };
      if (!response.ok) {
        throw new Error(errorMessage(data, "Day 2 demo seed failed"));
      }
      setQuestion(data.question ?? LEAVE_QUESTION);
      if (data.result) setResult(data.result);
      try {
        await refresh();
      } catch {
        // Answer already set from the same-instance demo response.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Day 2 demo failed");
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
          effectiveDate: uploadEffectiveDate || undefined,
          version: uploadVersion || undefined,
          policyFamily: uploadPolicyFamily || undefined,
        }),
      });
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(errorMessage(data, "Upload failed"));
      }
      resetUploadFields();
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

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadContent(await file.text());
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("name", file.name);
      if (uploadEffectiveDate) form.set("effectiveDate", uploadEffectiveDate);
      if (uploadVersion) form.set("version", uploadVersion);
      if (uploadPolicyFamily) form.set("policyFamily", uploadPolicyFamily);

      const response = await fetch("/api/documents", { method: "POST", body: form });
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(errorMessage(data, "PDF upload failed"));
      }
      setUploadContent("");
      setUploadVersion("");
      setUploadPolicyFamily("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:gap-12 sm:px-8 sm:py-16">
      <header className="space-y-3 sm:space-y-6">
        <p className="label-caps">scodes · Track C</p>
        <p className="brand-mark font-display text-[2.35rem] font-semibold tracking-tight sm:text-6xl md:text-8xl">
          CiteGuard
        </p>
        <div className="brand-rule" aria-hidden />
        <h1 className="max-w-xl text-[0.95rem] font-medium leading-relaxed text-[var(--page-muted)] sm:text-2xl sm:leading-snug">
          Ask policy questions. Get answers only when the documents support them —
          with the exact passage attached.
        </h1>
      </header>

      <section className="grid gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-7">
        <AskForm
          question={question}
          busy={busy}
          onQuestionChange={onQuestionChange}
          onSubmit={(event) => void onAsk(event)}
          onLoadDay2Demo={() => void onLoadDay2Demo()}
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
        <p
          className="glass-inset break-safe px-4 py-3 text-sm text-[var(--warn)]"
          role="alert"
        >
          {error}
        </p>
      )}

      <section className="grid gap-4 pt-1 sm:gap-6 sm:pt-2 lg:grid-cols-2 lg:gap-7">
        <SourcesPanel
          documents={documents}
          busy={busy}
          uploadName={uploadName}
          uploadContent={uploadContent}
          uploadEffectiveDate={uploadEffectiveDate}
          uploadVersion={uploadVersion}
          uploadPolicyFamily={uploadPolicyFamily}
          onUploadNameChange={setUploadName}
          onUploadContentChange={setUploadContent}
          onUploadEffectiveDateChange={setUploadEffectiveDate}
          onUploadVersionChange={setUploadVersion}
          onUploadPolicyFamilyChange={setUploadPolicyFamily}
          onFile={(file) => void onFile(file)}
          onSubmit={(event) => void onUpload(event)}
        />
        <AuditPanel audit={audit} />
      </section>
    </div>
  );
}
