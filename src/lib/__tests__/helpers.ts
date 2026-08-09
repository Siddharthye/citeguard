/** Shared helpers for unit tests that need DocumentRecord metadata. */
export function doc(
  id: string,
  name: string,
  content: string,
  extra: {
    effectiveDate?: string;
    version?: string;
    policyFamily?: string;
    uploadedAt?: string;
  } = {},
) {
  return {
    id,
    name,
    content,
    uploadedAt: extra.uploadedAt ?? "2024-01-01T00:00:00.000Z",
    effectiveDate: extra.effectiveDate ?? "2024-01-01",
    version: extra.version,
    policyFamily: extra.policyFamily ?? name.replace(/\.[^.]+$/, ""),
  };
}
