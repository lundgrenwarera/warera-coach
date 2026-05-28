import type { FactoryAction } from "./factories";

export type CoinPriority = {
  rank: number;
  spend: string;
  why: string;
};

export function coinPlan(args: { factoryAction: FactoryAction; level: number }): CoinPriority[] {
  const out: CoinPriority[] = [];
  let rank = 1;

  if (args.factoryAction.kind === "convert") {
    out.push({
      rank: rank++,
      spend: `Convert ${args.factoryAction.name} to ${args.factoryAction.targetItem} (no coin needed)`,
      why: "Closes you into the limestone → concrete chain. Self-produced limestone is free; concrete is the build currency for every future factory.",
    });
  } else if (args.factoryAction.kind === "build") {
    out.push({
      rank: rank++,
      spend: `Build factory: ${args.factoryAction.itemCode} (~${args.factoryAction.estimatedCost} coin in concrete)`,
      why: "BuhDeuce: 'if you ever have the funds to build a company, do so.' More factories = more income streams compounding from day one.",
    });
  } else if (args.factoryAction.kind === "upgrade") {
    out.push({
      rank: rank++,
      spend: `Upgrade ${args.factoryAction.name} → AE${args.factoryAction.targetAE} (steel)`,
      why: `The build chart requires AE${args.factoryAction.targetAE} on this factory before the next slot. Self-work it or pay market for steel — whichever is faster.`,
    });
  } else {
    out.push({
      rank: rank++,
      spend: "Hold coin for the next build or upgrade unlock",
      why: "All factories at the current phase target. Bank coin until the next level lifts factory cap or the AE phase advances.",
    });
  }

  if (args.level < 15) {
    out.push({
      rank: rank++,
      spend: "Sell starter bullets and food for cash",
      why: "BuhDeuce: 'the bullets and food you get are worthless because your damage is neglectful.' Convert them to coin and reinvest in factories.",
    });
    out.push({
      rank: rank++,
      spend: "Open loot boxes → scrap green/blue, sell purple+",
      why: "BuhDeuce loot-box rule: scrap low rarity for crafting scrap, sell purple and above for instant cash. Equipment isn't useful for you yet — cash now compounds faster.",
    });
  }

  out.push({
    rank: rank++,
    spend: "Avoid: hiring workers, expensive equipment, combat skill SP",
    why: "BuhDeuce: 'employees — just don't do it in the beginning, you'll probably end up losing money.' Same for premium gear and combat skills before you're ready for war at L20.",
  });

  return out;
}
