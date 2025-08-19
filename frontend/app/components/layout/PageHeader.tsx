import { formatTodayJalali } from "@/lib/date/jalai";
import { MarketMessages } from "@/lib/server/texts/marketMessages";
import Image from "next/image";

export default function PageHeader({ t }: { t: MarketMessages }) {
  // Server Component: تاریخ هر بار در رندر محاسبه می‌شود (بدون mismatch)
  const todayFa = formatTodayJalali();

  return (
    <header className="w-full flex flex-col items-center gap-4 py-4">
      <div className="flex items-center justify-between w-full max-w-6xl px-4">
        <div className="text-sm text-gray-500">{todayFa}</div>
        <Image
          src="/logo.svg"
          alt="Logo"
          width={56}
          height={56}
          priority
          className="opacity-90"
        />
      </div>
      <div className="text-center text-gray-700">{t.searchCta}</div>
    </header>
  );
}
