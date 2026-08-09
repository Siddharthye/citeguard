/**
 * Tiny JSON helpers for CiteGuardApp — keep fetch/error handling in one place.
 */

export async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function errorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return fallback;
}

export function networkHint(message: string): string {
  if (message === "Failed to fetch" || message.includes("NetworkError")) {
    return "Network error reaching the API. Retry once — cold starts on free hosting can drop the first request.";
  }
  return message;
}
