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
    <form onSubmit={onSubmit} className="space-y-4" data-testid="upload-form">
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
        onChange={(event) => onUploadNameChange(event.target.value)}
        placeholder="Document name"
        className="w-full border border-[var(--line)] bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--teal)]"
      />
      <textarea
        data-testid="upload-content"
        value={uploadContent}
        onChange={(event) => onUploadContentChange(event.target.value)}
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
  );
}
