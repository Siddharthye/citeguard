/**
 * Extract plain text from uploaded policy files.
 * PDF support uses unpdf (no native bindings — CI-friendly).
 */
export async function extractTextFromUpload(
  name: string,
  bytes: Uint8Array,
): Promise<string> {
  const lower = name.toLowerCase();

  if (lower.endsWith(".pdf")) {
    const { extractText } = await import("unpdf");
    const result = await extractText(bytes);
    const text = Array.isArray(result.text)
      ? result.text.join("\n")
      : String(result.text ?? "");
    const cleaned = text.replace(/\u0000/g, "").trim();
    if (!cleaned) {
      throw new Error("Could not extract text from PDF.");
    }
    return cleaned;
  }

  const decoded = new TextDecoder("utf-8").decode(bytes).trim();
  if (!decoded) {
    throw new Error("Uploaded file is empty.");
  }
  return decoded;
}
