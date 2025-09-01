// app/[role]/compare/page.tsx
import { fetchProductInfoSSR } from "@/lib/server/fetchProductinfo";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";
import ProductCompareTable from "@/app/components/market/ProductCompareTable";

type Role = "wholesaler" | "retailer";

export default async function ComparePage({
  searchParams,
  params,
}: {
  params: Promise<{ role: Role }>;
  searchParams: Promise<{ base?: string; target?: string }>;
}) {
  const { role } = await params;
  const { base, target } = await searchParams;
  const t = getMarketMessages("fa");

  if (!base || !target) {
    return <div dir="rtl" className="px-4 py-6 max-w-5xl mx-auto text-right">شناسه‌های مقایسه نامعتبر است.</div>;
  }

  const [a, b] = await Promise.all([
    fetchProductInfoSSR(Number(base)),
    fetchProductInfoSSR(Number(target)),
  ]);

  return (
    <div dir="rtl" className="px-4 py-6 max-w-5xl mx-auto text-right">
      <h1 className="text-lg font-semibold mb-4">
        مقایسه: {a.productInfo.brandTitle} {a.productInfo.modelName}  در برابر  {b.productInfo.brandTitle} {b.productInfo.modelName}
      </h1>

      <ProductCompareTable left={a.productInfo} right={b.productInfo} />
    </div>
  );
}
