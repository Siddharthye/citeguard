import type { DocumentSummary } from "./types";

type SourcesPanelProps = {
  documents: DocumentSummary[];
  busy: boolean;
  uploadName: string;
  uploadContent: string;
  onUploadNameChange: (value: string) => void;
  onUploadContentChange: (value: string) => void;
  onFile: (file: File | null) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export function SourcesPanel({
  documents,
  busy,
  uploadName,
  uploadContent,
  onUploadNameChange,
  onUploadContentChange,
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
        <h2 className="font-display text-2xl text-[var(--ink)] sm:text-3xl">Sources</h2>
        <p className="text-sm text-[var(--ink-muted)]">
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
      </div>
      <input
        data-testid="file-input"
        type="file"
        accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
        onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
        className="block w-full max-w-full text-sm text-[var(--ink-muted)] file:mr-3 file:mb-2 file:rounded-[980px] file:border-0 file:bg-[var(--ink)] file:px-3.5 file:py-2.5 file:text-sm file:font-semibold file:text-white sm:file:mb-0"
      />
      <input
        data-testid="upload-name"
        value={uploadName}
        onChange={(event) => onUploadNameChange(event.target.value)}
        placeholder="Document name"
        className="field px-3.5 py-3 placeholder:text-[var(--ink-faint)]"
        autoComplete="off"
      />
      <textarea
        data-testid="upload-content"
        value={uploadContent}
        onChange={(event) => onUploadContentChange(event.target.value)}
        rows={5}
        placeholder="Paste policy text (not needed for PDF — upload file directly)…"
        className="field resize-y px-3.5 py-3 placeholder:text-[var(--ink-faint)]"
        required
      />
      <button
        type="submit"
        data-testid="upload-button"
        disabled={busy}
        className="btn-secondary w-full sm:w-auto"
      >
        Add pasted document
      </button>

      <ul className="space-y-2 pt-1" data-testid="document-list">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="glass-inset flex flex-col gap-1 px-3.5 py-3 text-sm text-[var(--ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-2.5"
          >
            <span className="break-safe font-medium text-[var(--ink)]">{doc.name}</span>
            <time className="shrink-0 text-xs text-[var(--ink-faint)]">
              {new Date(doc.uploadedAt).toLocaleString()}
            </time>
          </li>
        ))}
      </ul>
    </form>
  );
}
