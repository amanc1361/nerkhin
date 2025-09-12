// app/components/shared/FilterControls.tsx
"use client";
import { useState } from "react";
import type { UserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { Search, Coins, Banknote, DollarSign } from "lucide-react";

type Option = { value: string | number; label: string };

export type FilterControlsValue = {
  brandIds: number[];
  categoryId?: number;
  subCategoryId?: number;
  isDollar?: boolean | null; // null => هر دو
  sortUpdated: "asc" | "desc";
  search: string;
};

type Props = {
  messages: UserProductMessages;
  // برای سازگاری با امضای قبلی
  brands?: Option[];
  categories?: Option[];
  subCategories?: Option[];
  initial?: Partial<FilterControlsValue>;
  onChange: (v: FilterControlsValue) => void;
  visible?: Partial<Record<"priceType" | "search", boolean>>;
};

export default function FilterControls({
  messages,
  initial,
  onChange,
  visible,
}: Props) {
  // payload کامل ولی UI مینیمال
  const [brandIds] = useState<number[]>(initial?.brandIds ?? []);
  const [categoryId] = useState<number | undefined>(initial?.categoryId);
  const [subCategoryId] = useState<number | undefined>(initial?.subCategoryId);
  const [sortUpdated] = useState<"asc" | "desc">(initial?.sortUpdated ?? "desc");

  const [isDollar, setIsDollar] = useState<boolean | null>(
    typeof initial?.isDollar === "boolean" ? initial?.isDollar : null
  );
  const [search, setSearch] = useState<string>(initial?.search ?? "");

  const t = messages.filters;
  const showPriceType = visible?.priceType ?? true;
  const showSearch = visible?.search ?? true;

  const buildPayload = (overrides?: Partial<FilterControlsValue>): FilterControlsValue => ({
    brandIds,
    categoryId,
    subCategoryId,
    isDollar,
    sortUpdated,
    search: search?.trim?.() ?? "",
    ...overrides,
  });

  const submitSearch = () => onChange(buildPayload());

  const changePriceType = (v: boolean | null) => {
    setIsDollar(v);
    onChange(buildPayload({ isDollar: v }));
  };

  return (
    <div dir="rtl" className="rounded-2xl border bg-white p-3 shadow-sm">
      {/* ردیف واحد (موبایل و دسکتاپ): سرچ + آیکن‌های قیمت */}
      <div className="flex items-center gap-2">
        {showSearch && (
          <div className="relative flex-1">
            <input
              className="w-full border rounded-xl pr-3 pl-10 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            />
            <button
              type="button"
              onClick={submitSearch}
              aria-label={t.searchPlaceholder}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 hover:bg-gray-100 active:scale-95 transition"
              title={t.searchPlaceholder}
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}

        {showPriceType && (
          <div
            className="flex items-center gap-1 rounded-xl border bg-gray-50 px-1 py-1"
            aria-label={t.priceType}
            title={t.priceType}
          >
            {/* همه */}
            <IconChip
              active={isDollar === null}
              onClick={() => changePriceType(null)}
              ariaLabel={t.priceAny}
              title={t.priceAny}
            >
              <Coins className="w-4 h-4" />
            </IconChip>

            {/* ریال / پول کاغذی */}
            <IconChip
              active={isDollar === false}
              onClick={() => changePriceType(false)}
              ariaLabel={t.priceRial}
              title={t.priceRial}
            >
              <Banknote className="w-4 h-4" />
            </IconChip>

            {/* دلار */}
            <IconChip
              active={isDollar === true}
              onClick={() => changePriceType(true)}
              ariaLabel={t.priceDollar}
              title={t.priceDollar}
            >
              <DollarSign className="w-4 h-4" />
            </IconChip>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- جزء مینیمال آیکنی --- */
function IconChip({
  active,
  onClick,
  ariaLabel,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      className={[
        "relative grid place-items-center rounded-lg p-2 transition",
        active
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:bg-white/70",
      ].join(" ")}
    >
      {children}
      {/* underline فعال با کنتراست قوی */}
      <span
        className={[
          "absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full",
          active ? "bg-blue-600" : "bg-transparent",
        ].join(" ")}
      />
    </button>
  );
}
