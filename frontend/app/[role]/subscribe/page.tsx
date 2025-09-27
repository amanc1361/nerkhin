// app/[role]/subscribe/page.tsx
import Link from "next/link";

// Next 15: params و searchParams از نوع Promise هستند
type Params = { role: string };
type Query = { msg?: string; next?: string; role?: string; reason?: string };

export default async function SubscribePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Query>;
}) {
  const { role: roleParam } = await params;
  const sp = await searchParams;

  const role = (sp?.role || roleParam || "").toLowerCase();
  const next = sp?.next || `/${role || ""}`;
  const baseMsg =
    sp?.msg ||
    (sp?.reason === "expired"
      ? "اشتراک شما منقضی شده است."
      : "برای دسترسی به این بخش نیاز به اشتراک فعال دارید.");

  const buyUrl =
    `/${role || "retailer"}/account/subscriptions` +
    (next ? `?next=${encodeURIComponent(next)}` : "");

  return (
    <main dir="rtl" className="min-h-[100dvh] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* کانتینر مرکزی */}
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        {/* هدر */}
        <header className="mb-6 sm:mb-10">
          <nav className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            <ol className="flex items-center gap-2">
              <li>
                <Link className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors" href={`/${role || ""}`}>
                  داشبورد
                </Link>
              </li>
              <li className="opacity-60">/</li>
              <li className="font-medium text-slate-700 dark:text-slate-200">اشتراک</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                دسترسی این بخش نیاز به اشتراک دارد
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300 leading-7">
                {baseMsg}
              </p>
            </div>

            {/* نقش کاربر */}
            {role ? (
              <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-100">
                <RoleIcon role={role} />
                <span className="capitalize">
                  {role === "wholesaler" ? "عمده‌فروش" : role === "retailer" ? "خرده‌فروش" : role}
                </span>
              </span>
            ) : null}
          </div>
        </header>

        {/* کارت اصلی */}
        <section className="relative">
          <div className="absolute inset-0 -z-10 mx-2 rounded-3xl bg-gradient-to-br from-sky-200/40 via-fuchsia-200/30 to-amber-200/40 blur-2xl dark:from-sky-400/10 dark:via-fuchsia-400/10 dark:to-amber-400/10" />
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:p-8 dark:border-slate-700/60 dark:bg-slate-900/70">
            {/* بنر هشدار/اطلاع */}
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 sm:p-5 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <WarningIcon />
                <div className="text-sm sm:text-[15px] leading-7">
                  <p className="font-semibold">اشتراک فعال یافت نشد</p>
                  <p className="opacity-90">
                    برای ادامه کار، اشتراک خود را از مسیر زیر تهیه یا تمدید کنید. پس از خرید، به صفحه قبلی باز خواهید گشت.
                  </p>
                </div>
              </div>
            </div>

            {/* مزایا / بولت‌ها */}
            <ul className="mb-8 grid gap-3 sm:grid-cols-2">
              {[
                "دسترسی کامل به نتایج و پیشنهادها",
                "فیلترهای پیشرفته و امکانات حرفه‌ای",
                "پشتیبانی و بروزرسانی مستمر",
                "بازگشت خودکار به مسیر قبلی بعد از خرید",
              ].map((t, i) => (
                <li key={i} className="group flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 p-3 leading-7 transition-colors hover:bg-white dark:border-slate-700/60 dark:bg-slate-800/50 dark:hover:bg-slate-800/80">
                  <CheckIcon />
                  <span className="text-slate-700 dark:text-slate-200 text-sm sm:text-[15px]">{t}</span>
                </li>
              ))}
            </ul>

            {/* CTA ها */}
            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-start">
              <Link
                href={next}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                بازگشت به صفحه قبلی
              </Link>

              <a
                href={buyUrl}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-900"
              >
                <SparklesIcon />
                <span className="ml-2">خرید / تمدید اشتراک</span>
              </a>
            </div>

            {/* راهنما / پشتیبانی */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <InfoIcon />
                <span>در صورت بروز مشکل در پرداخت، با پشتیبانی تماس بگیرید.</span>
              </div>
             
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ====== آیکن‌ها (SVG inline؛ بدون وابستگی خارجی) ====== */

function RoleIcon({ role }: { role: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 text-slate-500 dark:text-slate-300">
      {role === "wholesaler" ? (
        <path fill="currentColor" d="M3 7h18v2H3V7Zm2 4h14v2H5v-2Zm3 4h8v2H8v-2Z" />
      ) : (
        <path fill="currentColor" d="M12 2a5 5 0 0 1 5 5v1h1a3 3 0 0 1 0 6h-1v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5v-3H6a3 3 0 0 1 0-6h1V7a5 5 0 0 1 5-5Z" />
      )}
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400">
      <path fill="currentColor" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2V9h2v5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400">
      <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="mr-1.5 h-5 w-5">
      <path fill="currentColor" d="M5 3l1.5 3L10 7.5 6.5 9 5 12l-1.5-3L0 7.5 3.5 6 5 3zm14 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4zM9 13l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="currentColor" d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2Zm1 15v-6h-2v6h2Zm0-8V7h-2v2h2Z" />
    </svg>
  );
}
