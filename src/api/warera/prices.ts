import { trpcGet } from "./client";
import { PricesSchema } from "./schemas";
import type { Prices } from "./types";

export async function fetchPrices(): Promise<Prices> {
  const raw = await trpcGet("itemTrading.getPrices");
  return PricesSchema.parse(raw);
}
