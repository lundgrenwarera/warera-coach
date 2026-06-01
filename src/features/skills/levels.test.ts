import { describe, expect, it } from "vitest";
import { isBankLevel, spCostFor, spDelta, targetForLevel } from "./levels";

describe("spCostFor / spDelta", () => {
  it("spCostFor is the triangular SP cost to reach a skill level", () => {
    expect(spCostFor(0)).toBe(0);
    expect(spCostFor(1)).toBe(1);
    expect(spCostFor(2)).toBe(3);
    expect(spCostFor(3)).toBe(6);
    expect(spCostFor(7)).toBe(28);
  });

  it("spDelta is the incremental cost, and 0 when not advancing", () => {
    expect(spDelta(0, 2)).toBe(3);
    expect(spDelta(6, 7)).toBe(7);
    expect(spDelta(5, 5)).toBe(0);
    expect(spDelta(7, 3)).toBe(0);
  });
});

describe("targetForLevel", () => {
  it("clamps below the plan and tracks it", () => {
    expect(targetForLevel(1).production).toBe(2);
    expect(targetForLevel(0).level).toBe(1);
    expect(targetForLevel(99).level).toBe(15);
  });
});

describe("isBankLevel", () => {
  it("is true when the target is unchanged from the previous level", () => {
    expect(isBankLevel(11)).toBe(true);
    expect(isBankLevel(13)).toBe(true);
  });
  it("is false when a skill target advances", () => {
    expect(isBankLevel(2)).toBe(false);
  });
});
