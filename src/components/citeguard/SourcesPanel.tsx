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
      className="glass space-y-5 p-6 sm:p-7"
      data-testid="upload-form"
    >
      <div className="space-y-2">
        <h2 className="font-display text-3xl text-[var(--ink)]">Sources</h2>
        <p className="text-sm text-[var(--ink-muted)]">
          Paste policy text or upload{" "}
          <code className="rounded-md bg-white/40 px-1.5 py-0.5 text-[var(--midnight)]">
            .txt
          </code>{" "}
          /{" "}
          <code className="rounded-md bg-white/40 px-1.5 py-0.5 text-[var(--midnight)]">
            .md
          </code>{" "}
          /{" "}
          <code className="rounded-md bg-white/40 px-1.5 py-0.5 text-[var(--midnight)]">
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
        className="block w-full text-sm text-[var(--ink-muted)] file:mr-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-[var(--midnight)] file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-[var(--beige)]"
      />
      <input
        data-testid="upload-name"
        value={uploadName}
        onChange={(event) => onUploadNameChange(event.target.value)}
        placeholder="Document name"
        className="field px-3.5 py-2.5 text-sm placeholder:text-[var(--ink-faint)]"
      />
      <textarea
        data-testid="upload-content"
        value={uploadContent}
        onChange={(event) => onUploadContentChange(event.target.value)}
        rows={6}
        placeholder="Paste policy text (not needed for PDF — upload file directly)…"
        className="field resize-y px-3.5 py-2.5 text-sm placeholder:text-[var(--ink-faint)]"
        required
      />
      <button
        type="submit"
        data-testid="upload-button"
        disabled={busy}
        className="btn-secondary"
      >
        Add pasted document
      </button>

      <ul className="space-y-2 pt-1" data-testid="document-list">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="glass-inset flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm text-[var(--ink-muted)]"
          >
            <span>{doc.name}</span>
            <time className="text-xs text-[var(--ink-faint)]">
              {new Date(doc.uploadedAt).toLocaleString()}
            </time>
          </li>
        ))}
      </ul>
    </form>
  );
}
