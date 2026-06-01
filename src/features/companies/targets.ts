import type { Factory } from "@/api/warera/types";
import type { Rung } from "@/core/playbook";

export function phaseTargetAE(factories: Factory[], ladder: Rung[]): number {
  const count = factories.length;
  for (const rung of ladder) {
    if (count < rung.companies) return rung.ae;
    if (factories.some((f) => f.ae < rung.ae)) return rung.ae;
  }
  return ladder[ladder.length - 1]?.ae ?? 0;
}
