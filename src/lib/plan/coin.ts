import type { FactoryAction } from "./factories";

export type CoinPriority = {
  rank: number;
  spend: string;
  why: string;
};

export function coinPlan(args: { factoryAction: FactoryAction; level: number }): CoinPriority[] {
  const out: CoinPriority[] = [];
  let rank = 1;

  if (args.factoryAction.kind === "upgrade") {
    out.push({
      rank: rank++,
      spend: `AE upgrade on ${args.factoryAction.name}`,
      why: "Compounds forever. Highest return on coin under level 15.",
    });
  }
  if (args.factoryAction.kind === "build") {
    out.push({
      rank: rank++,
      spend: `Concrete for the next factory (~${args.factoryAction.estimatedCost} coin)`,
      why: "A new factory is a new income stream. Build, then upgrade.",
    });
  }
  out.push({
    rank: rank++,
    spend: "Steel stockpile",
    why: "Steel is the upgrade currency. Buy when it dips below 1.6 coin per unit.",
  });
  out.push({
    rank: rank++,
    spend: "Grey equipment under 2 coin per piece",
    why: "Below level 15 your damage is irrelevant. Cheap grey gear clears combat missions.",
  });
  if (args.level >= 15) {
    out.push({
      rank: rank++,
      spend: "Blue weapon and light ammo for real battles",
      why: "Your damage now matters. Pair with strong production so ammo stays affordable.",
    });
  }
  out.push({
    rank: rank++,
    spend: "Avoid: opening cases, hiring workers, expensive equipment, combat skills",
    why: "All negative-EV at this level per the development guide.",
  });
  return out;
}
