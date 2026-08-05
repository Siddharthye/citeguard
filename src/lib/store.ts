import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { chunkText } from "./chunk";
import type { AuditEntry, Chunk, DocumentRecord } from "./types";

type StoreShape = {
  documents: Map<string, DocumentRecord>;
  chunks: Chunk[];
  audit: AuditEntry[];
  seeded: boolean;
};

type PersistedStore = {
  documents: DocumentRecord[];
  audit: AuditEntry[];
};

const globalForStore = globalThis as typeof globalThis & {
  __citeguardStore?: StoreShape;
};

const DATA_DIR =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", "citeguard-data")
    : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

function createStore(): StoreShape {
  return {
    documents: new Map(),
    chunks: [],
    audit: [],
    seeded: false,
  };
}

function rebuildChunks(documents: Iterable<DocumentRecord>): Chunk[] {
  const chunks: Chunk[] = [];
  for (const document of documents) {
    chunks.push(...chunkText(document.content, document.id, document.name));
  }
  return chunks;
}

function persist(store: StoreShape): void {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const payload: PersistedStore = {
      documents: [...store.documents.values()],
      audit: store.audit,
    };
    writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
  } catch {
    // Persistence is best-effort for local/demo; in-memory still works.
  }
}

function loadFromDisk(): StoreShape | null {
  try {
    if (!existsSync(DATA_FILE)) return null;
    const raw = readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as PersistedStore;
    const store = createStore();
    for (const document of parsed.documents ?? []) {
      store.documents.set(document.id, document);
    }
    store.chunks = rebuildChunks(store.documents.values());
    store.audit = parsed.audit ?? [];
    store.seeded = store.documents.size > 0;
    return store;
  } catch {
    return null;
  }
}

export function getStore(): StoreShape {
  if (!globalForStore.__citeguardStore) {
    globalForStore.__citeguardStore = loadFromDisk() ?? createStore();
  }
  return globalForStore.__citeguardStore;
}

export function resetStore(): void {
  globalForStore.__citeguardStore = createStore();
  persist(globalForStore.__citeguardStore);
}

const SAMPLE_DOC_ID = "a1111111-1111-4111-8111-111111111111";

const SAMPLE_POLICY = `# Acme Workplace Policy Handbook

## Leave Policy
Employees receive 18 days of paid annual leave each calendar year.
Leave requests must be submitted at least 7 days in advance through the HR portal.
Unused leave may carry over up to 5 days into the next year with manager approval.

## Expense Reimbursement
Business expenses under $75 do not require pre-approval.
Expenses of $75 or more require written manager approval before purchase.
Receipts must be uploaded within 14 days of the expense date.
Personal expenses and alcohol are never reimbursable.

## Remote Work
Employees may work remotely up to 3 days per week after completing probation.
Core collaboration hours are 11:00–16:00 local time on remote days.
Sensitive customer data must not be processed on public Wi-Fi without a company VPN.

## Incident Reporting
Security incidents must be reported to security@acme.example within 4 hours of discovery.
Managers escalate unresolved incidents to the compliance officer within 24 hours.
`;

export function ensureSampleDocument(): DocumentRecord {
  const store = getStore();
  const existingById = store.documents.get(SAMPLE_DOC_ID);
  if (existingById) {
    store.seeded = true;
    return existingById;
  }

  const existingByName = [...store.documents.values()].find(
    (doc) => doc.name === "acme-workplace-policy.md",
  );
  if (existingByName) {
    store.seeded = true;
    return existingByName;
  }

  return addDocument("acme-workplace-policy.md", SAMPLE_POLICY, SAMPLE_DOC_ID);
}

export function addDocument(
  name: string,
  content: string,
  id: string = randomUUID(),
): DocumentRecord {
  const store = getStore();
  const document: DocumentRecord = {
    id,
    name,
    content,
    uploadedAt: new Date().toISOString(),
  };

  store.documents.set(id, document);
  store.chunks = [
    ...store.chunks.filter((chunk) => chunk.documentId !== id),
    ...chunkText(content, id, name),
  ];
  store.seeded = true;
  persist(store);
  return document;
}

export function listDocuments(): DocumentRecord[] {
  ensureSampleDocument();
  return [...getStore().documents.values()].sort((a, b) =>
    a.uploadedAt.localeCompare(b.uploadedAt),
  );
}

export function getDocument(id: string): DocumentRecord | undefined {
  ensureSampleDocument();
  return getStore().documents.get(id);
}

export function deleteDocument(id: string): boolean {
  const store = getStore();
  const existed = store.documents.delete(id);
  if (existed) {
    store.chunks = store.chunks.filter((chunk) => chunk.documentId !== id);
    persist(store);
  }
  return existed;
}

export function getChunks(): Chunk[] {
  ensureSampleDocument();
  return getStore().chunks;
}

export function addAudit(entry: Omit<AuditEntry, "id" | "createdAt">): AuditEntry {
  const store = getStore();
  const full: AuditEntry = {
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  store.audit.unshift(full);
  store.audit = store.audit.slice(0, 50);
  persist(store);
  return full;
}

export function listAudit(): AuditEntry[] {
  return getStore().audit;
}

export function auditToCsv(entries: AuditEntry[] = listAudit()): string {
  const header = ["createdAt", "question", "refused", "citationCount", "answer"];
  const rows = entries.map((entry) =>
    [
      entry.createdAt,
      entry.question,
      String(entry.refused),
      String(entry.citationCount),
      entry.answer,
    ]
      .map(csvEscape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

function csvEscape(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}
