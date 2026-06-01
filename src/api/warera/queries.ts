import { useQuery } from "@tanstack/react-query";
import { fetchCountry } from "./country";
import { fetchDates } from "./dates";
import { fetchPrices } from "./prices";
import { fetchProfile } from "./profile";
import { fetchRules } from "./rules";
import { searchUserPreviews } from "./search";

const REFRESH_MS = 5 * 60 * 1000;
const RULES_STALE_MS = 60 * 60 * 1000;

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ["user-search", query],
    queryFn: () => searchUserPreviews(query),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
}

export function useCountry(countryId: string | null) {
  return useQuery({
    queryKey: ["country", countryId],
    queryFn: () => fetchCountry(countryId as string),
    enabled: Boolean(countryId),
    staleTime: RULES_STALE_MS,
  });
}

export function useRules() {
  return useQuery({ queryKey: ["rules"], queryFn: fetchRules, staleTime: RULES_STALE_MS });
}

export function useDates() {
  return useQuery({
    queryKey: ["dates"],
    queryFn: fetchDates,
    staleTime: REFRESH_MS,
    refetchInterval: REFRESH_MS,
  });
}

export function usePrices() {
  return useQuery({
    queryKey: ["prices"],
    queryFn: fetchPrices,
    staleTime: REFRESH_MS,
    refetchInterval: REFRESH_MS,
  });
}

export function useProfile(name: string) {
  return useQuery({
    queryKey: ["profile", name.trim().toLowerCase()],
    queryFn: () => fetchProfile(name),
    enabled: name.trim().length > 0,
    staleTime: REFRESH_MS,
    refetchInterval: REFRESH_MS,
  });
}
