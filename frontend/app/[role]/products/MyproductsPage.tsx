// app/[role]/products/MyProductsPage.tsx
"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserProductVM } from "@/app/types/userproduct/userProduct";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { useUserProducts } from "@/app/hooks/userProductAction";
import { useUserProductActions } from "@/app/hooks/useuserProductAction";
import ProductsToolbar from "@/app/components/userproduct/ProductsToolbar";
import { toast } from "react-toastify";
import ProductsHeader from "@/app/components/userproduct/ProductsHeader";
import ProductsList from "@/app/components/userproduct/ProductsList";


export default function MyProductsPage({
  role, initialItems, usdPrice, locale = "fa",
}: {
  role: "wholesaler" | "retailer";
  initialItems: UserProductVM[];
  usdPrice?: number | string | null;
  locale?: "fa" | "en";
}) {
  const t = useMemo(() => getUserProductMessages(locale), [locale]);
  const router = useRouter();
  const addHref = `/${role}/categories`;

  const { items, loading, reload } = useUserProducts(initialItems);
  const { remove, changeStatus } = useUserProductActions(reload, locale);

  return (
    <div className="px-3 py-2 max-w-md mx-auto">
      <ProductsToolbar
        usdPrice={usdPrice}
        addHref={addHref}
        onShareJpg={() => toast("JPG…")}
        onSharePdf={() => toast("PDF…")}
        messages={t}
      />
      <ProductsHeader count={items?.length || 0} messages={t} />
      {loading ? (
        <div className="mt-3 text-sm text-neutral-500">در حال بارگذاری…</div>
      ) : items?.length ? (
        <div className="mt-3">
          <ProductsList
            items={items}
            messages={t}
            onEdit={(id) => router.push(`/${role}/products/${id}/edit`)}
            onDelete={(id) => { if (confirm(t.item.confirmDeleteText)) remove(id); }}
            onToggleVisible={(id) => changeStatus(id)}
          />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border p-6 text-center">
          <div className="font-medium">{t.empty.title}</div>
          <div className="text-sm text-neutral-500 mt-1">{t.empty.subtitle}</div>
          <a href={addHref} className="inline-block mt-3 rounded-xl bg-neutral-100 px-4 py-2 text-sm">
            {t.empty.cta}
          </a>
        </div>
      )}
    </div>
  );
}
