export function itemImg(code: string): string {
  return `https://app.warera.io/images/items/${code}.png?v=33`;
}

export function factoryUrl(id: string): string {
  return `https://app.warera.io/company/${id}`;
}

export interface RarityStyle {
  gradient: string;
  accent: string;
}

const RARITY: Record<string, RarityStyle> = {
  common: { gradient: "linear-gradient(45deg, rgb(42,46,50), rgb(18,20,22))", accent: "rgb(150,160,170)" },
  uncommon: { gradient: "linear-gradient(45deg, rgb(24,44,22), rgb(10,18,9))", accent: "rgb(94,168,79)" },
  rare: { gradient: "linear-gradient(45deg, rgb(18,34,54), rgb(8,15,25))", accent: "rgb(64,124,196)" },
  epic: { gradient: "linear-gradient(45deg, rgb(42,24,60), rgb(17,10,25))", accent: "rgb(150,90,200)" },
  legendary: { gradient: "linear-gradient(45deg, rgb(60,48,16), rgb(26,20,7))", accent: "rgb(206,162,58)" },
  mythic: { gradient: "linear-gradient(45deg, rgb(65,18,18), rgb(28,8,8))", accent: "rgb(184,50,52)" },
};

export const ITEM_FRAME_SHADOW = "rgb(11,13,15) 0px 0px 0px 1px, rgb(11,13,15) 0px 1px 0px 1px";

export function rarityStyle(rarity: string): RarityStyle {
  return RARITY[rarity] ?? RARITY.common;
}
