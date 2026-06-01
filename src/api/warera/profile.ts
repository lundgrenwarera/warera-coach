import { trpcGet } from "./client";
import {
  CompanyListSchema,
  CompanySchema,
  CountrySchema,
  type RawCompany,
  type RawRegion,
  type RawUser,
  RegionSchema,
  SearchSchema,
  UserSchema,
} from "./schemas";
import type { Factory, FactoryRegion, PlayerProfile, SkillLevels } from "./types";

function workPoints(skills: RawUser["skills"]) {
  const pp = skills?.production?.total ?? 10;
  const worksPerDay = ((skills?.energy?.hourlyBarRegen ?? 4) * 24) / 10;
  return { pp, worksPerDay, perDay: pp * worksPerDay };
}

async function fetchUser(userId: string): Promise<RawUser> {
  return UserSchema.parse(await trpcGet("user.getUserById", { userId }));
}

async function fetchCompany(companyId: string): Promise<RawCompany> {
  return CompanySchema.parse(await trpcGet("company.getById", { companyId }));
}

async function fetchRegion(regionId: string): Promise<RawRegion> {
  return RegionSchema.parse(await trpcGet("region.getById", { regionId }));
}

async function fetchCountryTax(countryId: string): Promise<number | null> {
  const c = CountrySchema.parse(await trpcGet("country.getCountryById", { countryId }));
  return c.taxes?.income ?? null;
}

async function settle<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

async function searchUserId(name: string): Promise<string | null> {
  const data = SearchSchema.parse(await trpcGet("search.searchAnything", { searchText: name }));
  const ids = data.userIds ?? [];
  for (const id of ids) {
    try {
      const u = await fetchUser(id);
      if (u.username?.toLowerCase() === name.toLowerCase()) return id;
    } catch {
      /* try the next candidate */
    }
  }
  return ids[0] ?? null;
}

export async function fetchProfile(name: string): Promise<PlayerProfile | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const userId = await searchUserId(trimmed);
  if (!userId) return null;
  const user = await fetchUser(userId);

  const owner = workPoints(user.skills);
  const skills: SkillLevels = {
    production: user.skills?.production?.level ?? 0,
    energy: user.skills?.energy?.level ?? 0,
    entrepreneurship: user.skills?.entrepreneurship?.level ?? 0,
    companies: user.skills?.companies?.level ?? 0,
    management: user.skills?.management?.level ?? 0,
  };
  const skillValues: SkillLevels = {
    production: user.skills?.production?.value ?? 0,
    energy: user.skills?.energy?.value ?? 0,
    entrepreneurship: user.skills?.entrepreneurship?.value ?? 0,
    companies: user.skills?.companies?.value ?? 0,
    management: user.skills?.management?.value ?? 0,
  };
  const allSkills: Record<string, number> = {};
  for (const [code, s] of Object.entries(user.skills ?? {})) allSkills[code] = s.level ?? 0;

  const listing = CompanyListSchema.parse(await trpcGet("company.getCompanies", { userId, perPage: 100 }));
  const companyIds = (listing.items ?? [])
    .map((e) => (typeof e === "string" ? e : e._id))
    .filter((x): x is string => Boolean(x));
  const companies = await Promise.all(companyIds.map(fetchCompany));

  const regionIds = [...new Set(companies.map((c) => c.region).filter((x): x is string => Boolean(x)))];
  const regionMap = new Map<string, RawRegion>();
  await Promise.all(
    regionIds.map(async (id) => {
      const r = await settle(fetchRegion(id));
      if (r) regionMap.set(id, r);
    }),
  );

  const countryIds = [...new Set([...regionMap.values()].map((r) => r.country).filter((x): x is string => Boolean(x)))];
  const taxMap = new Map<string, number | null>();
  await Promise.all(countryIds.map(async (id) => taxMap.set(id, await settle(fetchCountryTax(id)))));

  const regionFor = (regionId?: string): FactoryRegion | null => {
    const r = regionId ? regionMap.get(regionId) : undefined;
    if (!r) return null;
    return {
      name: r.name ?? "Unknown region",
      terrain: r.biome ?? "",
      countryCode: r.countryCode ?? null,
      tax: r.country ? (taxMap.get(r.country) ?? null) : null,
    };
  };

  const factories: Factory[] = companies.map((c) => {
    const u = c.activeUpgradeLevels ?? {};
    return {
      id: c._id,
      name: c.name ?? "Company",
      item: c.itemCode,
      ae: u.automatedEngine ?? 1,
      storage: u.storage ?? 1,
      breakRoom: u.breakRoom ?? 1,
      stock: c.production ?? 0,
      workerCount: c.workerCount ?? 0,
      workerPointsPerDay: 0,
      workerWageWeightedPoints: 0,
      estimatedValue: c.estimatedValue ?? 0,
      region: regionFor(c.region),
    };
  });

  return {
    userId,
    username: user.username ?? trimmed,
    avatarUrl: user.avatarUrl ?? null,
    countryId: user.country ?? null,
    level: user.leveling?.level ?? null,
    availableSkillPoints: user.leveling?.availableSkillPoints ?? 0,
    spentSkillPoints: user.leveling?.spentSkillPoints ?? 0,
    money: user.stats?.wealth?.money ?? null,
    pointsPerWork: owner.pp,
    worksPerDay: owner.worksPerDay,
    hasJob: Boolean(user.company),
    skills,
    skillValues,
    allSkills,
    factories,
  };
}
