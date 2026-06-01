const BASE = "https://api2.warera.io/trpc";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function trpcGet<T>(procedure: string, input?: Record<string, unknown>): Promise<T> {
  const url = new URL(`${BASE}/${procedure}`);
  if (input) url.searchParams.set("input", JSON.stringify(input));

  let res: Response;
  try {
    res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  } catch {
    throw new ApiError(0, `Network error reaching War Era (${procedure})`);
  }

  if (!res.ok) throw new ApiError(res.status, `${procedure} returned ${res.status}`);

  const body = (await res.json()) as { result?: { data?: T }; error?: { message?: string } };
  if (body.error) throw new ApiError(500, body.error.message ?? `${procedure} failed`);
  if (!body.result || body.result.data === undefined) throw new ApiError(500, `${procedure} returned no data`);
  return body.result.data;
}
