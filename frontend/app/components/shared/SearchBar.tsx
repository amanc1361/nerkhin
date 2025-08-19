"use client";

import { MarketMessages } from "@/lib/server/texts/marketMessages";
import { useRouter } from "next/navigation";


export default function SearchBar({
  t,
  role, // "wholesaler" | "retailer"
  initialQuery = "",
}: {
  t: MarketMessages;
  role: "wholesaler" | "retailer";
  initialQuery?: string;
}) {
  const router = useRouter();

  return (
    <form
      className="w-full max-w-2xl mx-auto px-4"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const q = (new FormData(form).get("q") as string)?.trim() ?? "";
        const base = role === "wholesaler" ? "/wholesaler/search" : "/retailer/search";
        router.push(`${base}?q=${encodeURIComponent(q)}`);
      }}
    >
      <div className="relative">
        <input
          name="q"
          defaultValue={initialQuery}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 transition"
        >
          {t.menu.search}
        </button>
      </div>
    </form>
  );
}
