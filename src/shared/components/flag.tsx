import { flagUrl } from "@/api/warera/country";
import { useCountry } from "@/api/warera/queries";
import { cn } from "@/shared/lib/utils";

export function CountryFlag({ countryId, className }: { countryId: string | null; className?: string }) {
  const country = useCountry(countryId);
  const url = flagUrl(country.data?.code);
  if (!url) return null;
  return (
    <img
      src={url}
      alt={country.data?.name ?? ""}
      title={country.data?.name}
      className={cn("h-3 w-4 rounded-[1px] object-cover", className)}
    />
  );
}

export function CountryLabel({ countryId }: { countryId: string | null }) {
  const country = useCountry(countryId);
  if (!country.data) return null;
  const url = flagUrl(country.data.code);
  return (
    <span className="inline-flex items-center gap-1">
      {url && <img src={url} alt="" className="h-3 w-4 rounded-[1px] object-cover" />}
      {country.data.name}
    </span>
  );
}
