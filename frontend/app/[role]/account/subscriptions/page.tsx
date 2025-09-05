// app/[role]/account/subscriptions/page.tsx
import Link from "next/link";
import { getSubscriptionMessages } from "@/lib/server/texts/subscriptionMessages";
import { getCitiesForFiltering } from "@/lib/server/server-api"; // همین فایل خودت
import CityPlansClient from "@/app/components/panel/subscriptions/CityPlansClient";


export const dynamic = "force-dynamic";
export const revalidate = 0;

type City = { id: number | string; title?: string; name?: string };

export default async function Page() {
  const t = getSubscriptionMessages("fa");

  // ✅ SSR: فقط شهرها را می‌گیریم
  const cities = await getCitiesForFiltering().catch(() => [] as City[]);

  // فقط دیتا (بدون تابع) به کلاینت پاس می‌دهیم
  const serializableCities = cities.map(c => ({
    id: typeof c.id === "string" ? Number(c.id) : Number(c.id),
    title: (c as any).title || (c as any).name || "",
  }));

  return (
    <div dir="rtl" className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Link href=".." className="text-sm text-cyan-700 hover:underline">← {t.back}</Link>
        <h1 className="text-lg VazirFontMedium">{t.title}</h1>
        <span className="opacity-0">.</span>
      </div>

      {/* کلاینت‌کامپوننت: انتخاب شهر + دریافت پلن‌های همان شهر + خرید */}
      <CityPlansClient cities={serializableCities} />
    </div>
  );
}
