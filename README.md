# War Era Coach

A personalised min/max leveling plan for War Era players. Type your username, get a coaching report grounded in the community's top-tipped guides.

Live: https://lundgrenwarera.github.io/warera-coach/

## What it does

- Looks up your public profile through the War Era API (no login, read-only).
- Compares your current level, skills, and factories to the canonical eco-build from the top community guides.
- Tells you the single highest-EV next action, a daily checklist that resets at UTC midnight, what to spend coin on, and what to do at the next few level-ups.

## How it works

`src/lib/plan/` holds the rules:

- `levels.ts` — the level 1 to level 15 skill build table, the 4 SP/level rule, the triangular cost formula, and the "bank levels" logic (L8 and L12 want you to hold points).
- `skills.ts` — audit your current skill levels against the level target.
- `factories.ts` — the upgrade-before-build rule, the canonical factory order, and the starter-conversion check.
- `daily.ts` — composes the day's checklist.
- `coin.ts` — coin priorities in spend order.
- `sources.ts` — the guides each rule is cited from.

Everything is plain functions. Open `levels.ts` and you can read the whole plan top to bottom.

## Sources

- [Welcome to War Era: Development Guide](https://app.warera.io/article/698cbabb2e96c13ef4214dde)
- [Tervetuloa WarEraan: Aloittelijan opas](https://app.warera.io/article/6a1436fea637d8b322289b86) (Finnish, has the level-by-level table)
- [Ultimate Guide For New Players](https://app.warera.io/article/6a055506428f1f3693348d38)
- [Beginner's Guide 101: Early Game](https://app.warera.io/article/69b09e79b5486e4fd9af882f)
- [Eco skill point distribution](https://app.warera.io/article/69ada296d957cd6e8aa25208) (covers level 16+)

## Contributing

Found a step that's wrong, missing, or off-meta? Open an issue or send a PR. Most steps are direct guide quotes; a few are interpolations (mostly the pre-L5 path) and those are easy to argue with. The lookup tables in `src/lib/plan/levels.ts` are the place to start.

## Local dev

```
pnpm install
pnpm dev
```

## License

MIT. Not affiliated with War Era.
