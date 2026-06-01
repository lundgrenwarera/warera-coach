import { ArrowLeft, Check, ChevronRight, Pencil, Terminal, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useCoachStore } from "@/shared/lib/store";
import { Button } from "@/ui/button";
import { INVENTORY_SCRIPT } from "./import-inventory";

export function ImportChoice({
  userId,
  userKey,
  onManual,
  onClose,
}: {
  userId: string;
  userKey: string;
  onManual: () => void;
  onClose: () => void;
}) {
  const setInventory = useCoachStore((s) => s.setInventory);
  const [mode, setMode] = useState<"intro" | "script">("intro");
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState("");
  const [count, setCount] = useState<number | null>(null);

  const copy = () =>
    navigator.clipboard?.writeText(INVENTORY_SCRIPT).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );

  const apply = () => {
    try {
      const data = JSON.parse(text);
      if (!data || typeof data !== "object") return;
      const items: Record<string, number> = {};
      for (const [k, v] of Object.entries(data)) {
        const n = Number(v);
        if (!Number.isNaN(n) && n > 0) items[k] = n;
      }
      if (Object.keys(items).length === 0) return;
      setInventory(userKey, { items, importedAt: Date.now() });
      setCount(Object.keys(items).length);
    } catch {
      /* ignore bad paste */
    }
  };

  if (mode === "intro") {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm leading-relaxed">
          War Era&rsquo;s API doesn&rsquo;t expose inventory, so we can&rsquo;t fetch it for you. Two ways to add it:
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={onManual}
            className="border-border bg-card hover:border-primary/60 hover:bg-primary/5 group flex items-center justify-between gap-2 rounded-lg border p-3.5 text-left transition-colors"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Pencil className="size-4" /> Enter manually
              </span>
              <span className="text-muted-foreground mt-1 block text-xs">Type quantities into the grid yourself.</span>
            </span>
            <ChevronRight className="text-muted-foreground/50 size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => setMode("script")}
            className="border-border bg-card hover:border-primary/60 hover:bg-primary/5 group flex items-center justify-between gap-2 rounded-lg border p-3.5 text-left transition-colors"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Terminal className="size-4" /> Fetch with a script
              </span>
              <span className="text-muted-foreground mt-1 block text-xs">
                Paste a snippet in your console to grab it all.
              </span>
            </span>
            <ChevronRight className="text-muted-foreground/50 size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
        <Button variant="outline" className="w-full" onClick={onClose}>
          Skip for now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setMode("intro")}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
      >
        <ArrowLeft className="size-3" /> other options
      </button>
      <div className="border-chart-3/30 bg-chart-3/5 text-muted-foreground flex items-start gap-2 rounded-lg border p-2.5 text-xs leading-relaxed">
        <TriangleAlert className="text-chart-3 mt-0.5 size-3.5 shrink-0" />
        <span>
          Only use the script on your <strong className="text-foreground">own account</strong>, it reads whichever
          inventory is open in your browser, so it&rsquo;s useless for other players. And never run a console script you
          don&rsquo;t understand: paste it into your favourite AI and ask if it&rsquo;s safe first.
        </span>
      </div>
      <ol className="text-muted-foreground list-inside list-decimal space-y-1.5 text-sm">
        <li className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="bg-primary text-primary-foreground rounded-md px-2.5 py-1 text-xs font-medium"
          >
            {copied ? "Copied ✓" : "Copy script"}
          </button>
          then
          <a
            href={`https://app.warera.io/user/${userId}/inventory`}
            target="_blank"
            rel="noreferrer"
            className="text-primary font-medium underline"
          >
            open your inventory ↗
          </a>
        </li>
        <li>Open the console (F12), paste, press Enter, it auto-copies the result.</li>
        <li>Paste the result below.</li>
      </ol>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='{"limestone":377,"iron":7}'
        className="border-border bg-background h-16 w-full rounded-md border p-2 text-xs outline-none"
      />
      {count == null ? (
        <Button size="sm" onClick={apply} disabled={!text.trim()}>
          Import
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-chart-2 flex items-center gap-1.5 text-xs font-medium">
            <Check className="size-3.5" /> Imported {count} items, refine them anytime from the Inventory button.
          </p>
          <Button size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
