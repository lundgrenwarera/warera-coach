import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import type { Prices } from "@/api/warera/types";
import { useCoachStore } from "@/shared/lib/store";
import { cn } from "@/shared/lib/utils";
import { ImportInventory } from "./import-inventory";
import { inventoryFreshness } from "./inventory";
import { InventoryItem } from "./inventory-item";
import { INVENTORY_SECTIONS, RARITY_BY_CODE } from "./inventory-sections";

function ago(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function InventoryPanel({ userKey, userId, prices }: { userKey: string; userId: string; prices: Prices }) {
  const stored = useCoachStore((s) => s.inventories[userKey]);
  const setInventory = useCoachStore((s) => s.setInventory);
  const items = stored?.items ?? {};
  const importedAt = stored?.importedAt ?? null;

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const inv: Record<string, string> = {};
  for (const [k, v] of Object.entries(items)) inv[k] = String(v);

  const handleChange = (item: string, value: string) => {
    const n = Number(value);
    const next = { ...items };
    if (!value || Number.isNaN(n) || n <= 0) delete next[item];
    else next[item] = n;
    setInventory(userKey, { items: next, importedAt });
  };

  const handleImport = (text: string) => {
    try {
      const data = JSON.parse(text);
      if (!data || typeof data !== "object") return;
      const next: Record<string, number> = {};
      for (const [k, v] of Object.entries(data)) {
        const n = Number(v);
        if (!Number.isNaN(n) && n > 0) next[k] = n;
      }
      if (Object.keys(next).length === 0) return;
      setInventory(userKey, { items: next, importedAt: Date.now() });
    } catch {
      /* ignore bad paste */
    }
  };

  const freshness = inventoryFreshness(stored);
  const stale = freshness === "stale";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {importedAt != null && (
          <span className={cn("flex items-center gap-1 text-xs", stale ? "text-destructive" : "text-muted-foreground")}>
            {stale && <TriangleAlert className="size-3" />}
            imported {ago(importedAt)}
          </span>
        )}
        <div className="ml-auto">
          <ImportInventory
            onImport={handleImport}
            inventoryUrl={`https://app.warera.io/user/${userId}/inventory`}
            freshness={freshness}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-x-5 gap-y-3">
        {INVENTORY_SECTIONS.map((sec) => (
          <div key={sec.title}>
            <h3 className="text-muted-foreground mb-1.5 text-sm font-medium">{sec.title}</h3>
            <div className="flex gap-1">
              {sec.items.map((code) => (
                <InventoryItem
                  key={code}
                  item={code}
                  rarity={RARITY_BY_CODE[code] ?? "common"}
                  price={prices[code] ?? null}
                  inv={inv}
                  onChange={handleChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
