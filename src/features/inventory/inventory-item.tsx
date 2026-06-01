import { Coin } from "@/shared/components/item-display";
import { ITEM_FRAME_SHADOW, itemImg, rarityStyle } from "@/shared/lib/item-meta";
import { itemLabel } from "@/shared/lib/items";

type Props = {
  item: string;
  rarity: string;
  price: number | null;
  inv: Record<string, string>;
  onChange: (item: string, value: string) => void;
};

export const InventoryItem = ({ item, rarity, price, inv, onChange }: Props) => {
  const r = rarityStyle(rarity);
  return (
    <label
      title={itemLabel(item)}
      className="flex w-[52px] shrink-0 cursor-text flex-col overflow-hidden"
      style={{
        backgroundImage: r.gradient,
        boxShadow: ITEM_FRAME_SHADOW,
        borderRadius: "3px",
        color: "rgb(210,218,223)",
        fontFamily: "Saira, system-ui, sans-serif",
      }}
    >
      <div className="flex aspect-square items-center justify-center p-0.5">
        <img
          src={itemImg(item)}
          alt={itemLabel(item)}
          draggable={false}
          loading="lazy"
          className="size-full object-contain"
        />
      </div>
      <div className="flex items-center justify-center gap-0.5 px-1 py-0.5 text-[10px] font-semibold leading-none">
        <Coin className="shrink-0" style={{ color: r.accent }} />
        <span className="tabular-nums">{price == null ? "—" : price.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-center bg-black/45 px-1 py-0.5">
        <input
          type="number"
          min={0}
          value={inv[item] ?? ""}
          onChange={(e) => onChange(item, e.target.value)}
          placeholder="0"
          className="w-full bg-transparent text-center text-[11px] font-semibold leading-none tabular-nums text-white outline-none placeholder:text-white/35 [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </label>
  );
};
