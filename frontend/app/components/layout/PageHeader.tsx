
import { formatTodayJalali } from "@/lib/date/jalai";
import { MarketMessages } from "@/lib/server/texts/marketMessages";
import Image from "next/image";

export default function PageHeader({ t }: { t: MarketMessages }) {
  return (
    <section dir="rtl" className="relative isolate">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(56,189,248,0.25),transparent),radial-gradient(800px_400px_at_10%_-10%,rgba(99,102,241,0.18),transparent)]" />
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <div className="flex items-center justify-between">
          <div className="text-xs md:text-sm text-slate-600">{formatTodayJalali()}</div>
          <Image src="/logo.svg" alt="Logo" width={56} height={56} priority className="drop-shadow" />
        </div>
      </div>
    </section>
  );
}
