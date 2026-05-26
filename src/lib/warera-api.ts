const BASE = "https://api2.warera.io/trpc";

async function trpcGet<T>(endpoint: string, input?: Record<string, unknown>): Promise<T> {
  const url = new URL(`${BASE}/${endpoint}`);
  if (input) url.searchParams.set("input", JSON.stringify(input));
  const r = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!r.ok) throw new ApiError(r.status, `${endpoint} returned ${r.status}`);
  const body = await r.json();
  if (body?.error) throw new ApiError(500, body.error?.message ?? "tRPC error");
  return body.result.data as T;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, msg: string) {
    super(msg);
    this.status = status;
  }
}

export type Skill = { level: number };

export type WareraUser = {
  _id: string;
  username: string;
  leveling?: {
    level: number;
    availableSkillPoints: number;
    totalSkillPoints: number;
    spentSkillPoints: number;
  };
  skills?: Record<string, Skill>;
};

export type Company = {
  _id: string;
  name?: string;
  itemCode: string;
  activeUpgradeLevels?: { automatedEngine?: number };
  production?: number;
  isFull?: boolean;
};

type SearchResult = { userIds?: string[] };

export async function searchUserByName(username: string): Promise<string | null> {
  const trimmed = username.trim();
  if (!trimmed) return null;
  const data = await trpcGet<SearchResult>("search.searchAnything", { searchText: trimmed });
  const ids = data?.userIds ?? [];
  if (ids.length === 0) return null;
  for (const id of ids) {
    try {
      const u = await fetchUser(id);
      if (u.username?.toLowerCase() === trimmed.toLowerCase()) return id;
    } catch {
      /* skip and try next */
    }
  }
  return ids[0];
}

export async function fetchUser(userId: string): Promise<WareraUser> {
  return trpcGet<WareraUser>("user.getUserById", { userId });
}

export async function fetchCompanies(userId: string): Promise<Company[]> {
  const listing = await trpcGet<{ items?: Array<string | { _id?: string }> }>(
    "company.getCompanies",
    { userId, perPage: 100 },
  );
  const ids = (listing.items ?? [])
    .map((e) => (typeof e === "string" ? e : e?._id))
    .filter((x): x is string => !!x);
  const companies = await Promise.all(ids.map((id) => trpcGet<Company>("company.getById", { companyId: id })));
  return companies;
}
