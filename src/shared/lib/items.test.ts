import { describe, expect, it } from "vitest";
import { itemLabel } from "./items";

describe("itemLabel", () => {
  it("title-cases single words and camelCase", () => {
    expect(itemLabel("limestone")).toBe("Limestone");
    expect(itemLabel("heavyAmmo")).toBe("Heavy Ammo");
    expect(itemLabel("lightAmmo")).toBe("Light Ammo");
  });

  it("spaces a trailing digit", () => {
    expect(itemLabel("case1")).toBe("Case 1");
    expect(itemLabel("gloves1")).toBe("Gloves 1");
  });

  it("applies overrides", () => {
    expect(itemLabel("cocain")).toBe("Pill");
  });
});
