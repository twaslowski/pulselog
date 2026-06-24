export class FetchError extends Error {
  status: number;
  info: unknown;

  constructor(message: string, status: number, info: unknown) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.info = info;
  }
}

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    let info: unknown;
    try {
      info = await res.json();
    } catch {
      info = await res.text().catch(() => null);
    }
    throw new FetchError(
      `Request failed: ${res.status} ${res.statusText}`,
      res.status,
      info,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new FetchError(
      `Expected JSON but got "${contentType}"`,
      res.status,
      null,
    );
  }

  return res.json() as Promise<T>;
}
