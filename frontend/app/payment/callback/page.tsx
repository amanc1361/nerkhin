// app/payment/callback/page.tsx
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { fetchUserInfo } from "@/lib/server/server-api";
import { normalizeRole, UserRole } from "@/app/types/role";
import { createUserSubscriptionSSR } from "@/lib/server/sunScriptionAction";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// در Next.js 15 searchParams به صورت Promise می‌آید
type SearchParams = Record<string, string | string[] | undefined>;

// کمک‌تابع برای خواندن پارامترها با حروف بزرگ/کوچک مختلف
function read(sp: SearchParams, key: string) {
  const direct = sp[key];
  const lower = sp[key.toLowerCase()];
  const upper = sp[key.toUpperCase()];
  const v = direct ?? lower ?? upper ?? "";
  return Array.isArray(v) ? (v[0] ?? "") : (v as string);
}

function roleSegmentFrom(user: any): "wholesaler" | "retailer" {
  const n = normalizeRole(user?.role);
  return n === UserRole.Wholesaler ? "wholesaler" : "retailer";
}

function isActiveSubscription(status?: string, expiresAt?: string | number | Date) {
  const ok = status === "active" || status === "trial";
  if (!ok) return false;
  if (!expiresAt) return false;
  const t = typeof expiresAt === "number" ? expiresAt : new Date(expiresAt as any).getTime();
  return t > Date.now();
}

export default async function PaymentCallback({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  noStore();

  // 1) پارامترهای کال‌بک درگاه
  const sp = await searchParams;
  const status = String(read(sp, "Status")).toUpperCase();
  const authority = String(read(sp, "Authority") || "");

  // 2) تعیین نقش برای مسیر مقصد
  let roleSegment: "wholesaler" | "retailer" = "retailer";
  try {
    const user = await fetchUserInfo();
    roleSegment = roleSegmentFrom(user);
  } catch {
    // اگر سشن/توکن نداشتیم، پیش‌فرض retailer
  }

  const failureRedirectPath = `/${roleSegment}/account/subscriptions?error=payment_failed`;

  // 3) اگر درگاه OK نگفت یا authority نداریم → شکست
  if (status !== "OK" || !authority) {
    return redirect(failureRedirectPath);
  }

  // 4) Verify/ثبت اشتراک
  try {
    await createUserSubscriptionSSR(authority);
    // موفق (یا ایدمپوتنت) → برو به صفحه‌ی موفقیت
    return redirect(`/payment/success?role=${roleSegment}`);
  } catch {
    // اگر verify throw کرد، وضعیت واقعی کاربر را یک بار چک کن
    try {
      const u = await fetchUserInfo();
      const verified = isActiveSubscription(
        (u as any)?.subscriptionStatus,
        (u as any)?.subscriptionExpiresAt
      );
      return redirect(verified ? `/payment/success?role=${roleSegment}` : failureRedirectPath);
    } catch {
      return redirect(failureRedirectPath);
    }
  }
}
