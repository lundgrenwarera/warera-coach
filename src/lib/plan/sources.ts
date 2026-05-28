export type SourceRef = {
  id: string;
  title: string;
  url: string;
  language: "en" | "fi";
};

export const SOURCES: Record<string, SourceRef> = {
  buhDeuce: {
    id: "buhDeuce",
    title: "PERFECT ECONOMIC GUIDE",
    url: "https://app.warera.io/article/69998fd7d87267cb1de203d7",
    language: "en",
  },
  devGuide: {
    id: "devGuide",
    title: "Welcome to War Era: Development Guide",
    url: "https://app.warera.io/article/698cbabb2e96c13ef4214dde",
    language: "en",
  },
  finnishGuide: {
    id: "finnishGuide",
    title: "Tervetuloa WarEraan: Aloittelijan opas",
    url: "https://app.warera.io/article/6a1436fea637d8b322289b86",
    language: "fi",
  },
  ultimateNew: {
    id: "ultimateNew",
    title: "Ultimate Guide For New Players",
    url: "https://app.warera.io/article/6a055506428f1f3693348d38",
    language: "en",
  },
  beginner101: {
    id: "beginner101",
    title: "Beginner's Guide 101: Early Game",
    url: "https://app.warera.io/article/69b09e79b5486e4fd9af882f",
    language: "en",
  },
  ecoDistribution: {
    id: "ecoDistribution",
    title: "Eco skill point distribution",
    url: "https://app.warera.io/article/69ada296d957cd6e8aa25208",
    language: "en",
  },
};
