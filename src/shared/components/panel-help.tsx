import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";

export interface HelpSource {
  label: string;
  href: string;
}

export function PanelHelp({
  title,
  sources,
  children,
}: {
  title: string;
  sources?: HelpSource[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`About ${title}`}
        className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
      >
        <HelpCircle className="size-4" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="text-muted-foreground space-y-2.5 text-sm leading-relaxed">{children}</div>
          {sources && sources.length > 0 && (
            <div className="border-border/60 text-muted-foreground mt-1 border-t pt-3 text-xs">
              {sources.length === 1 ? "Source: " : "Sources: "}
              {sources.map((s, i) => (
                <span key={s.href}>
                  {i > 0 && ", "}
                  <a href={s.href} target="_blank" rel="noreferrer" className="text-foreground hover:underline">
                    {s.label}
                  </a>
                </span>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
