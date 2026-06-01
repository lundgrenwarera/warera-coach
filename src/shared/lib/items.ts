const LABEL_OVERRIDES: Record<string, string> = {
  cocain: "Pill",
};

export function itemLabel(code: string): string {
  if (LABEL_OVERRIDES[code]) return LABEL_OVERRIDES[code];
  const spaced = code.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Za-z])(\d)/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
