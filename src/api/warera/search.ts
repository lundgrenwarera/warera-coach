import { trpcGet } from "./client";
import { SearchSchema, UserSchema } from "./schemas";

export interface UserPreview {
  userId: string;
  username: string;
  avatarUrl: string | null;
  level: number | null;
  countryId: string | null;
}

export async function searchUserPreviews(query: string, limit = 6): Promise<UserPreview[]> {
  const data = SearchSchema.parse(await trpcGet("search.searchAnything", { searchText: query }));
  const ids = (data.userIds ?? []).slice(0, limit);
  const users = await Promise.all(
    ids.map(async (id): Promise<UserPreview | null> => {
      try {
        const u = UserSchema.parse(await trpcGet("user.getUserById", { userId: id }));
        return {
          userId: id,
          username: u.username ?? id,
          avatarUrl: u.avatarUrl ?? null,
          level: u.leveling?.level ?? null,
          countryId: u.country ?? null,
        };
      } catch {
        return null;
      }
    }),
  );
  return users.filter((u): u is UserPreview => u !== null);
}
