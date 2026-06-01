import { Coins, Database, ListOrdered, Package, Rocket, UserX, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useCoachStore } from "@/shared/lib/store";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";

interface Slide {
  icon: typeof Rocket;
  what: string;
  why: string;
}

const SLIDES: Slide[] = [
  {
    icon: Rocket,
    what: "Build companies as fast as you can afford",
    why: "Every company is another income stream that compounds from day one. The sooner it exists, the more it earns you.",
  },
  {
    icon: ListOrdered,
    what: "Build in order: limestone, concrete, iron, steel",
    why: "Each company feeds the next (limestone makes concrete, the build material for everything later), so you lean on the volatile market less while you are still learning it.",
  },
  {
    icon: Coins,
    what: "Sell early ammo and food for cash",
    why: "Your damage is negligible this early, so combat resources are dead weight. Turn them into coin and reinvest in companies and upgrades.",
  },
  {
    icon: Package,
    what: "Loot boxes: scrap green and blue, sell purple and above",
    why: "Low-rarity gear nets more dismantled into scrap, then sold, than sold whole. Purple and above fetches instant cash. Equipment will not help you yet.",
  },
  {
    icon: Zap,
    what: "Log in and work before energy caps",
    why: "Energy and entrepreneurship refill over roughly 10 hours. Work at least that often on the best-paying offer you qualify for, or that XP and coin go to waste.",
  },
  {
    icon: Database,
    what: "Storage full? Upgrade it first",
    why: "A full store means a company is wasting everything it produces. Storage jumps ahead of AE upgrades when output is capped.",
  },
  {
    icon: UserX,
    what: "Do not hire workers yet",
    why: "Employees usually cost more than they make you this early. Skip hiring, premium gear, and combat skills until your economy is stable.",
  },
];

export function IntroModal({ level }: { level: number | null }) {
  const introSeen = useCoachStore((s) => s.introSeen);
  const setIntroSeen = useCoachStore((s) => s.setIntroSeen);
  const [i, setI] = useState(0);
  const isNewPlayer = (level ?? 0) < 10;

  useEffect(() => {
    if (!isNewPlayer && !introSeen) setIntroSeen(true);
  }, [isNewPlayer, introSeen, setIntroSeen]);

  useEffect(() => {
    if (!introSeen) setI(0);
  }, [introSeen]);

  if (!isNewPlayer) return null;

  const slide = SLIDES[i];
  const Icon = slide.icon;
  const last = i === SLIDES.length - 1;
  const close = () => setIntroSeen(true);

  return (
    <Dialog
      open={!introSeen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        className="max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">New-player game plan</DialogTitle>
        <div className="space-y-4">
          <span className="label text-primary">New-player game plan</span>
          <div className="flex min-h-[8.5rem] gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Icon className="size-5" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base leading-snug font-semibold">{slide.what}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{slide.why}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {SLIDES.map((s, idx) => (
                <span
                  key={s.what}
                  className={cn("size-1.5 rounded-full transition-colors", idx === i ? "bg-primary" : "bg-border")}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {i > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setI(i - 1)}>
                  Back
                </Button>
              )}
              {last ? (
                <Button size="sm" onClick={close}>
                  Let&rsquo;s go
                </Button>
              ) : (
                <Button size="sm" onClick={() => setI(i + 1)}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
