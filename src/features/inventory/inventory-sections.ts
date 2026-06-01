export interface InventorySection {
  title: string;
  items: string[];
}

export const INVENTORY_SECTIONS: InventorySection[] = [
  { title: "Cases", items: ["case1", "case2"] },
  { title: "Craft", items: ["scraps"] },
  { title: "Buffs", items: ["cocain", "coca"] },
  { title: "Ammo", items: ["lightAmmo", "ammo", "heavyAmmo", "lead"] },
  { title: "Food", items: ["bread", "steak", "cookedFish", "fish", "livestock", "grain"] },
  { title: "Construction", items: ["concrete", "steel", "oil", "petroleum", "iron", "limestone"] },
];

export const RARITY_BY_CODE: Record<string, string> = {
  case1: "legendary",
  case2: "mythic",
  scraps: "rare",
  cocain: "epic",
  coca: "common",
  lightAmmo: "uncommon",
  ammo: "rare",
  heavyAmmo: "epic",
  lead: "common",
  bread: "uncommon",
  steak: "rare",
  cookedFish: "epic",
  fish: "common",
  livestock: "common",
  grain: "common",
  concrete: "uncommon",
  steel: "uncommon",
  oil: "uncommon",
  petroleum: "common",
  iron: "common",
  limestone: "common",
};
