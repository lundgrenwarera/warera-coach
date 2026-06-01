import type { StoredInventory } from "@/shared/lib/store";

export type Freshness = "never" | "fresh" | "stale";

const HOUR_MS = 60 * 60 * 1000;

export function inventoryFreshness(stored: StoredInventory | undefined): Freshness {
  const importedAt = stored?.importedAt ?? null;
  if (importedAt == null) return "never";
  const crossedRegen = Math.floor(Date.now() / HOUR_MS) > Math.floor(importedAt / HOUR_MS);
  return crossedRegen ? "stale" : "fresh";
}
