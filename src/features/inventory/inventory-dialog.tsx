import { Package } from "lucide-react";
import { useState } from "react";
import type { Prices } from "@/api/warera/types";
import { LinkedHeading } from "@/shared/components/linked-heading";
import { useCoachStore } from "@/shared/lib/store";
import { cn } from "@/shared/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { ImportChoice } from "./import-choice";
import { type Freshness, inventoryFreshness } from "./inventory";
import { InventoryPanel } from "./inventory-panel";

const FRESH: Record<Freshness, { label: string; cls: string }> = {
  never: { label: "not imported", cls: "border-sky-400/40 bg-sky-400/10 text-sky-400" },
  fresh: { label: "fresh", cls: "border-chart-2/40 bg-chart-2/10 text-chart-2" },
  stale: { label: "stale", cls: "border-destructive/40 bg-destructive/10 text-destructive" },
};

export function InventoryDialog({ userKey, userId, prices }: { userKey: string; userId: string; prices: Prices }) {
  const stored = useCoachStore((s) => s.inventories[userKey]);
  const tourSeen = useCoachStore((s) => s.tourSeen);
  const inventoryOpened = useCoachStore((s) => s.inventoryOpened);
  const setInventoryOpened = useCoachStore((s) => s.setInventoryOpened);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"choice" | "grid">("grid");
  const fresh = FRESH[inventoryFreshness(stored)];
  const pulse = tourSeen && !inventoryOpened;

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setView(inventoryOpened ? "grid" : "choice");
    } else if (!inventoryOpened) {
      setInventoryOpened(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        title="Inventory"
        data-tour="inventory"
        className={cn(
          "border-border hover:border-foreground/30 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
          pulse && "pulse-attn border-primary/50",
        )}
      >
        <Package className="size-3.5" />
        Inventory
        <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", fresh.cls)}>
          {fresh.label}
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        {view === "choice" ? (
          <>
            <DialogTitle className="text-base font-semibold">Import your inventory</DialogTitle>
            <ImportChoice
              userId={userId}
              userKey={userKey}
              onManual={() => setView("grid")}
              onClose={() => setOpen(false)}
            />
          </>
        ) : (
          <>
            <DialogTitle>
              <LinkedHeading title="Inventory" href={`https://app.warera.io/user/${userId}/inventory`} />
            </DialogTitle>
            <InventoryPanel userKey={userKey} userId={userId} prices={prices} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
