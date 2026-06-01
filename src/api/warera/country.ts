import { trpcGet } from "./client";
import { CountrySchema } from "./schemas";

export interface Country {
  id: string;
  name: string;
  code: string | null;
}

export async function fetchCountry(countryId: string): Promise<Country> {
  const c = CountrySchema.parse(await trpcGet("country.getCountryById", { countryId }));
  return { id: c._id, name: c.name ?? "Unknown", code: c.code ?? null };
}

export function flagUrl(code: string | null | undefined): string | null {
  if (!code) return null;
  return `https://app.warera.io/images/flags/${code.toLowerCase()}.svg?v=16`;
}
