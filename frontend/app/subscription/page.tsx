// app/subscribe/page.tsx  (Server Component)
import Link from "next/link";

type Query = Record<string, string | string[] | undefined>;

function firstStr(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function addParam(url: string, key: string, value: string) {
  const hasQuery = url.includes("?");
  const sep = hasQuery ? "&" : "?";
  return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

function toSafePath(p: string | undefined, fallback = "/") {
  if (!p) return fallback;
  if (/^https?:\/\//i.test(p) || /\s/.test(p)) return fallback;
  return p.startsWith("/") ? p : `/${p}`;
}

export default async function SubscribePage({
  searchParams,
}: {
  // ✅ Next 15: فقط Promise یا undefined مجاز است
  searchParams?: Promise<Query>;
}) {
  // اگر undefined بود، آبجکت خالی جایگزین کن
  const sp: Query = (searchParams ? await searchParams : {}) as Query;

  const msgParam = firstStr(sp.msg);
  const buyParam = firstStr(sp.buy);
  const nextParam = firstStr(sp.next);
  const reasonParam = firstStr(sp.reason);

  const msg =
    msgParam ||
    (reasonParam === "expired"
      ? "اشتراک شما منقضی شده است."
      : "برای دسترسی به این بخش نیاز به اشتراک فعال دارید.");

  const buyUrl = buyParam || "https://nerrkhin.com/subscribe/buy";
  const next = toSafePath(nextParam, "/");
  const buyHref = next ? addParam(buyUrl, "next", next) : buyUrl;

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="rounded-2xl border p-6 shadow-sm bg-white">
        <h1 className="text-xl font-bold mb-3">اشتراک لازم است</h1>
        <p className="text-gray-700 leading-7 mb-6">{msg}</p>

        <div className="flex items-center gap-3">
          <a
            href={buyHref}
            className="inline-flex items-center rounded-xl px-4 py-2 border font-medium hover:opacity-90"
          >
            خرید اشتراک
          </a>
          <Link
            href={next}
            className="inline-flex items-center rounded-xl px-4 py-2 bg-gray-900 text-white hover:opacity-90"
          >
            بازگشت
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          در صورت وجود سوال با پشتیبانی تماس بگیرید.
        </p>
      </div>
    </main>
  );
}
