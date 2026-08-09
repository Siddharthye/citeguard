import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { chunkText } from "./chunk";
import { derivePolicyFamily, parseEffectiveDate } from "./policy-version";
import { SAMPLE_DOC_ID, SAMPLE_POLICY } from "./sample-policy";
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

export type DocumentMetaInput = {
  effectiveDate?: string;
  version?: string;
  policyFamily?: string;
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

function normalizeDocument(raw: DocumentRecord): DocumentRecord {
  const uploadedAt = raw.uploadedAt || new Date().toISOString();
  return {
    ...raw,
    uploadedAt,
    effectiveDate: parseEffectiveDate(raw.effectiveDate, uploadedAt),
    version: raw.version,
    policyFamily:
      raw.policyFamily || derivePolicyFamily(raw.name, raw.policyFamily),
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
      const normalized = normalizeDocument(document as DocumentRecord);
      store.documents.set(normalized.id, normalized);
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

  return addDocument("acme-workplace-policy.md", SAMPLE_POLICY, SAMPLE_DOC_ID, {
    effectiveDate: "2024-01-01",
    version: "2024",
    policyFamily: "acme-workplace-policy",
  });
}

export function addDocument(
  name: string,
  content: string,
  id: string = randomUUID(),
  meta: DocumentMetaInput = {},
): DocumentRecord {
  const store = getStore();
  const uploadedAt = new Date().toISOString();
  const document: DocumentRecord = {
    id,
    name,
    content,
    uploadedAt,
    effectiveDate: parseEffectiveDate(meta.effectiveDate, uploadedAt),
    version: meta.version?.trim() || undefined,
    policyFamily: derivePolicyFamily(name, meta.policyFamily),
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
