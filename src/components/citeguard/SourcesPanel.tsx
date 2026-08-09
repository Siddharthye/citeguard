import { StatusBadge } from "./StatusBadge";
import type { DocumentSummary } from "./types";

type SourcesPanelProps = {
  documents: DocumentSummary[];
  busy: boolean;
  uploadName: string;
  uploadContent: string;
  uploadEffectiveDate: string;
  uploadVersion: string;
  uploadPolicyFamily: string;
  onUploadNameChange: (value: string) => void;
  onUploadContentChange: (value: string) => void;
  onUploadEffectiveDateChange: (value: string) => void;
  onUploadVersionChange: (value: string) => void;
  onUploadPolicyFamilyChange: (value: string) => void;
  onFile: (file: File | null) => void;
  onSubmit: (event: React.FormEvent) => void;
};

function familyHasSupersession(
  documents: DocumentSummary[],
  family: string,
): boolean {
  return documents.some(
    (doc) =>
      doc.policyFamily === family && doc.currencyStatus === "superseded",
  );
}

export function SourcesPanel({
  documents,
  busy,
  uploadName,
  uploadContent,
  uploadEffectiveDate,
  uploadVersion,
  uploadPolicyFamily,
  onUploadNameChange,
  onUploadContentChange,
  onUploadEffectiveDateChange,
  onUploadVersionChange,
  onUploadPolicyFamilyChange,
  onFile,
  onSubmit,
}: SourcesPanelProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="glass space-y-4 p-4 sm:space-y-5 sm:p-7"
      data-testid="upload-form"
    >
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-[var(--ink)] sm:text-3xl">
          Sources
        </h2>
        <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
          Paste policy text or upload{" "}
          <code className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[var(--teal)]">
            .txt
          </code>{" "}
          /{" "}
          <code className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[var(--teal)]">
            .md
          </code>{" "}
          /{" "}
          <code className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[var(--teal)]">
            .pdf
          </code>
          .
        </p>
        <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
          Set an <strong className="font-semibold text-[var(--ink)]">effective date</strong>{" "}
          and matching{" "}
          <strong className="font-semibold text-[var(--ink)]">policy family</strong>{" "}
          so older versions can be superseded.
        </p>
      </div>

      <input
        data-testid="file-input"
        type="file"
        accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
        onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
        className="block w-full max-w-full text-sm text-[var(--ink-muted)] file:mr-3 file:mb-2 file:min-h-11 file:rounded-[980px] file:border-0 file:bg-[var(--ink)] file:px-3.5 file:py-2.5 file:text-sm file:font-semibold file:text-white sm:file:mb-0"
      />

      <input
        data-testid="upload-name"
        value={uploadName}
        onChange={(event) => onUploadNameChange(event.target.value)}
        placeholder="Document name"
        className="field min-h-11 px-3.5 py-3 placeholder:text-[var(--ink-faint)]"
        autoComplete="off"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--ink-muted)]">
          Effective date
          <input
            data-testid="upload-effective-date"
            type="date"
            value={uploadEffectiveDate}
            onChange={(event) => onUploadEffectiveDateChange(event.target.value)}
            className="field min-h-11 px-3 py-2.5 text-base"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--ink-muted)]">
          Version
          <input
            data-testid="upload-version"
            value={uploadVersion}
            onChange={(event) => onUploadVersionChange(event.target.value)}
            placeholder="e.g. 2024"
            className="field min-h-11 px-3 py-2.5 text-base placeholder:text-[var(--ink-faint)]"
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--ink-muted)]">
          Policy family
          <input
            data-testid="upload-policy-family"
            value={uploadPolicyFamily}
            onChange={(event) => onUploadPolicyFamilyChange(event.target.value)}
            placeholder="e.g. leave-policy"
            className="field min-h-11 px-3 py-2.5 text-base placeholder:text-[var(--ink-faint)]"
            autoComplete="off"
          />
        </label>
      </div>

      <textarea
        data-testid="upload-content"
        value={uploadContent}
        onChange={(event) => onUploadContentChange(event.target.value)}
        rows={5}
        placeholder="Paste policy text (not needed for PDF — upload file directly)…"
        className="field resize-y px-3.5 py-3 text-base placeholder:text-[var(--ink-faint)]"
        required
      />

      <button
        type="submit"
        data-testid="upload-button"
        disabled={busy}
        className="btn-secondary w-full touch-manipulation sm:w-auto"
      >
        Add pasted document
      </button>

      <ul className="space-y-2 pt-1" data-testid="document-list">
        {documents.map((doc) => {
          const showCurrent =
            doc.currencyStatus === "current" &&
            familyHasSupersession(documents, doc.policyFamily);

          return (
            <li
              key={doc.id}
              className="glass-inset flex flex-col gap-2 px-3.5 py-3 text-sm text-[var(--ink-muted)]"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="break-safe font-medium text-[var(--ink)]">
                    {doc.name}
                  </span>
                  {doc.currencyStatus === "superseded" && (
                    <StatusBadge kind="superseded" testId="badge-superseded" />
                  )}
                  {showCurrent && (
                    <StatusBadge kind="current" testId="badge-current" />
                  )}
                </div>
                <time className="shrink-0 text-xs text-[var(--ink-faint)]">
                  uploaded {new Date(doc.uploadedAt).toLocaleString()}
                </time>
              </div>
              <p
                className="break-safe text-xs leading-relaxed text-[var(--ink-faint)]"
                data-testid="document-meta"
              >
                <span className="block sm:inline">
                  effective {doc.effectiveDate}
                </span>
                {doc.version ? (
                  <span className="block sm:inline">
                    <span className="hidden sm:inline"> · </span>v{doc.version}
                  </span>
                ) : null}
                {doc.policyFamily ? (
                  <span className="block sm:inline">
                    <span className="hidden sm:inline"> · </span>
                    family {doc.policyFamily}
                  </span>
                ) : null}
                {doc.supersededByName ? (
                  <span className="mt-1 block text-[var(--warn)] sm:mt-0 sm:inline sm:text-[var(--ink-faint)]">
                    <span className="hidden sm:inline"> · </span>
                    replaced by {doc.supersededByName}
                  </span>
                ) : null}
              </p>
            </li>
          );
        })}
      </ul>
    </form>
  );
}
