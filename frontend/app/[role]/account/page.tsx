// app/[role]/account/page.tsx
import { AccountHeaderCard } from "@/app/components/account/AccountHeaderCard";
import AccountListItem from "@/app/components/account/AccountListItem";
import AccountQuickActions from "@/app/components/account/AccountQuickActions";
import SignOutRow from "@/app/components/account/SignOutRow";
import ActiveSubscriptions from "@/app/components/account/ActiveSubscriptions";

import { normalizeRole, UserRole } from "@/app/types/role";
import { getAccountMessages } from "@/lib/server/texts/accountMessages";
import { fetchUserInfo } from "@/lib/server/server-api";
import { FetchUserInfoResponse, SubscriptionStatusVM } from "@/app/types/account/subscriptionstatus";

// تایپ‌های جدید فقط ایمپورت می‌شن؛ هیچ تایپ قبلی‌ای بازتعریف نشده


export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ---------- helpers (بدون متن هاردکد) ---------- */
function toMonthDayDiff(now: Date, endISO?: string | null) {
  if (!endISO) return null;
  const end = new Date(endISO);
  const ms = end.getTime() - now.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const daysTotal = Math.floor(ms / (1000 * 60 * 60 * 24));
  const months = Math.floor(daysTotal / 30);
  const days = daysTotal % 30;
  return { months, days };
}

function validityTextFromSubs(locale: "fa" | "en", subs: SubscriptionStatusVM[]) {
  // فقط از اشتراک‌های فعال اعتبار باقی‌مانده را حساب می‌کنیم
  const actives = (subs || []).filter((s) => s.isActive && !!s.expiresAt);
  if (actives.length === 0) return null;

  const latest = actives
    .map((s) => s.expiresAt)
    .filter(Boolean)
    .sort((a, b) => new Date(a!).getTime() - new Date(b!).getTime())
    .at(-1);

  const diff = toMonthDayDiff(new Date(), latest || null);
  if (!diff) return null;

  const t = getAccountMessages(locale);
  const monthsLbl = "header" in t && t.header?.months ? t.header.months : "";
  const daysLbl = "header" in t && t.header?.days ? t.header.days : "";

  if (diff.months === 0) {
    // فقط روز
    return `${diff.days} ${daysLbl}`.trim();
  }

  // ماه و روز
  return `${diff.months} ${monthsLbl} و ${diff.days} ${daysLbl}`.trim();
}

/* ---------- page ---------- */
export default async function AccountPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  // Next.js 15: params یک Promise است
  const { role } = await params;

  const roleSegment = (role === "wholesaler" ? "wholesaler" : "retailer") as
    | "wholesaler"
    | "retailer";

  const locale: "fa" | "en" = "fa";
  const t = getAccountMessages(locale);

  // نکته مهم: امضای fetchUserInfo را تغییر نمی‌دهیم.
  // در اینجا فقط خروجی را به تایپ جدید cast می‌کنیم تا به subscriptions دسترسی داشته باشیم.
  const info = (await fetchUserInfo()) as unknown as FetchUserInfoResponse;

  const { user, subscriptions } = info;
  const nRole = normalizeRole(roleSegment);
  const isWholesale = nRole === UserRole.Wholesaler;

  // فقط اشتراک‌های فعال (طبق خواسته شما)
  const activeSubs = (subscriptions || []).filter((s) => s.isActive && s.daysRemaining > 0);

  const validityText = validityTextFromSubs(locale, activeSubs);

  const HeartIcon = (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );

  return (
    <main className="mx-auto max-w-screen-sm px-3 py-4">
      {/* Header card */}
      <AccountHeaderCard
        role={nRole}
        locale={locale}
        user={{
          fullName: user.fullName,
          imageUrl: user.imageUrl,
          shopName: user.shopName,
          shopAddress: user.shopAddress,
          shopPhone1: user.shopPhone1,
          shopPhone2: user.shopPhone2,
          shopPhone3: user.shopPhone3,
          instagramUrl: user.instagramUrl,
          telegramUrl: user.telegramUrl,
          whatsappUrl: user.whatsappUrl,
          websiteUrl: user.websiteUrl,
          latitude: user.latitude as any,
          longitude: user.longitude as any,
        }}
        validityText={validityText || undefined}
      />

      {/* فقط اشتراک‌های فعال (بدون نمایش منقضی‌ها) */}
      <ActiveSubscriptions locale={locale} items={activeSubs} />

      {/* Quick actions */}
      <AccountQuickActions
        role={nRole}
        roleSegment={roleSegment}
        locale={locale}
      />

      {/* List items */}
      <div className="mt-4 space-y-3">
        <AccountListItem
          href={`/${roleSegment}/favorites`}
          title={t.list.likes}
          icon={HeartIcon}
        />
        {isWholesale && (
          <AccountListItem
            href={`/${roleSegment}/favorites/my-customers`}
            title={t.list.customers}
            icon={<span className="text-lg">👥</span>}
          />
        )}
        <AccountListItem
          href={`/${roleSegment}/subscription/payment-history`}
          title={t.list.transactions}
          icon={<span className="text-lg">💳</span>}
        />
        <AccountListItem
          href={`/rules`}
          title={t.list.rules}
          icon={<span className="text-lg">📘</span>}
        />

        {/* Sign out */}
        <SignOutRow />
      </div>
    </main>
  );
}
