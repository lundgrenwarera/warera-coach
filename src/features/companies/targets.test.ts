import { describe, expect, it } from "vitest";
import type { Factory } from "@/api/warera/types";
import { PLAYBOOKS } from "@/core/playbook";
import { phaseTargetAE } from "./targets";

const ladder = PLAYBOOKS[0].ladder;

function f(ae: number): Factory {
  return {
    id: "x",
    name: "x",
    item: "limestone",
    ae,
    storage: 1,
    breakRoom: 1,
    stock: 0,
    workerCount: 0,
    workerPointsPerDay: 0,
    workerWageWeightedPoints: 0,
    estimatedValue: 0,
    region: null,
  };
}

describe("phaseTargetAE", () => {
  it("targets AE3 for an early company below AE3", () => {
    expect(phaseTargetAE([f(1)], ladder)).toBe(3);
  });

  it("pushes to AE4 once 3 companies sit at AE3", () => {
    expect(phaseTargetAE([f(3), f(3), f(3)], ladder)).toBe(4);
  });

  it("advances toward AE5 then AE6 as the 6-company core maxes out", () => {
    expect(phaseTargetAE([f(4), f(4), f(4), f(4), f(4), f(4)], ladder)).toBe(5);
    expect(phaseTargetAE([f(5), f(5), f(5), f(5), f(5), f(5)], ladder)).toBe(6);
  });
});
