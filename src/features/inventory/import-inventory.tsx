import { DownloadCloud, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import type { Freshness } from "./inventory";

function Wordmark() {
  return <span className="font-semibold tracking-tight">War Era</span>;
}

export const INVENTORY_SCRIPT = `(()=>{const o={};document.querySelectorAll('img[alt]').forEach(img=>{const src=img.getAttribute('src')||'';if(!src.includes('/images/items/'))return;const code=img.getAttribute('alt');if(!code)return;let el=img,qtyEl=null;for(let i=0;i<6&&el;i++){el=el.parentElement;if(!el)break;qtyEl=el.querySelector('div[style*="inline-block"] span');if(qtyEl)break;}let q=0;if(qtyEl){const r=qtyEl.textContent.trim().toLowerCase().replace(/,/g,'').replace(/[^0-9.km]/g,'');const m=parseFloat(r);if(!isNaN(m))q=r.includes('k')?m*1e3:r.includes('m')?m*1e6:m;}o[code]=Math.round(q);});const j=JSON.stringify(o);console.log(j);try{copy(j);}catch(e){}return o;})()`;

const FRESH_STYLE: Record<Freshness, { btn: string; dot: string; label: string }> = {
  never: {
    btn: "border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20",
    dot: "bg-sky-400",
    label: "never imported",
  },
  fresh: {
    btn: "border-chart-2/40 bg-chart-2/10 text-chart-2 hover:bg-chart-2/20",
    dot: "bg-chart-2",
    label: "up to date",
  },
  stale: {
    btn: "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
    dot: "bg-destructive",
    label: "stale, re-import",
  },
};

export function ImportInventory({
  onImport,
  inventoryUrl,
  freshness,
}: {
  onImport: (text: string) => void;
  inventoryUrl: string;
  freshness: Freshness;
}) {
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState("");
  const f = FRESH_STYLE[freshness];
  const copy = () => {
    navigator.clipboard?.writeText(INVENTORY_SCRIPT).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  };
  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setText("");
      }}
    >
      <DialogTrigger
        title={f.label}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
          f.btn,
        )}
      >
        <span className={cn("size-2 rounded-full", f.dot)} />
        <DownloadCloud className="size-3.5" />
        Import from <Wordmark />
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DownloadCloud className="text-chart-3 size-4" />
            Import inventory from <Wordmark />
          </DialogTitle>
          <DialogDescription>
            This gives you a small script that reads the item counts off your <Wordmark /> inventory page, which you
            paste into your browser console.
          </DialogDescription>
        </DialogHeader>

        <div className="border-chart-3/30 bg-chart-3/5 text-chart-3 flex items-start gap-2 rounded-lg border p-2.5 text-xs">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Never run a console script you don&rsquo;t understand. Paste it into your favorite AI first and ask it to
            confirm it&rsquo;s safe before running it.
          </span>
        </div>

        <ol className="text-muted-foreground list-inside list-decimal space-y-1.5 text-xs">
          <li className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copy}
              className="bg-primary text-primary-foreground rounded-md px-2.5 py-1 font-medium"
            >
              {copied ? "Copied ✓" : "Copy script"}
            </button>
            <span>then</span>
            <a href={inventoryUrl} target="_blank" rel="noreferrer" className="text-primary font-medium underline">
              open inventory ↗
            </a>
          </li>
          <li>Open the browser console (F12 → Console), paste, press Enter — it auto-copies the result</li>
          <li>Paste the copied result into the box below</li>
        </ol>

        <textarea
          value={text}
          placeholder='Paste result here, e.g. {"limestone":377,"iron":7}'
          onChange={(e) => setText(e.target.value)}
          className="border-border bg-background h-20 w-full rounded-md border p-2 text-xs outline-none"
        />

        <DialogFooter>
          <DialogClose
            onClick={() => onImport(text)}
            className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            Done
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
