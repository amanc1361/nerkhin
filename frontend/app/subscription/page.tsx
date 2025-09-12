// app/subscribe/page.tsx  (Server Component)
import Link from "next/link";

export default function SubscribePage({
  searchParams,
}: {
  searchParams: { msg?: string; buy?: string; next?: string; reason?: string };
}) {
  const msg =
    searchParams?.msg ||
    (searchParams?.reason === "expired"
      ? "اشتراک شما منقضی شده است."
      : "برای دسترسی به این بخش نیاز به اشتراک فعال دارید.");

  const buyUrl = searchParams?.buy || "https://nerkhin.com/subscribe/buy";
  const next = searchParams?.next || "/";

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="rounded-2xl border p-6 shadow-sm bg-white">
        <h1 className="text-xl font-bold mb-3">اشتراک لازم است</h1>
        <p className="text-gray-700 leading-7 mb-6">{msg}</p>

        <div className="flex items-center gap-3">
          <a
            href={buyUrl + (next ? `?next=${encodeURIComponent(next)}` : "")}
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
