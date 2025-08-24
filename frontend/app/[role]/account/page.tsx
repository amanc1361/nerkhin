// app/[role]/account/page.tsx

import { AccountHeaderCard } from "@/app/components/account/AccountHeaderCard";
import AccountListItem from "@/app/components/account/AccountListItem";
import AccountQuickActions from "@/app/components/account/AccountQuickActions";
import SignOutRow from "@/app/components/account/SignOutRow";
import { UserSubscription } from "@/app/types/account/account";
import { normalizeRole, UserRole } from "@/app/types/role";
import { fetchUserInfo, fetchUserSubscriptions } from "@/lib/server/server-api";
import { getAccountMessages } from "@/lib/server/texts/accountMessages";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ---------- helpers ---------- */
function toMonthDayDiff(now: Date, end?: string | null) {
  if (!end) return null;
  const endDt = new Date(end);
  const ms = endDt.getTime() - now.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const daysTotal = Math.floor(ms / (1000 * 60 * 60 * 24));
  const months = Math.floor(daysTotal / 30);
  const days = daysTotal % 30;
  return { months, days };
}

function validityTextFromSubs(locale: "fa" | "en", subs: UserSubscription[]) {
  if (!Array.isArray(subs) || subs.length === 0) return null;
  const latest = subs
    .map((s) => s.endAt)
    .filter(Boolean)
    .sort((a, b) => new Date(a!).getTime() - new Date(b!).getTime())
    .at(-1);
  const diff = toMonthDayDiff(new Date(), latest || null);
  if (!diff) return null;
  const t = getAccountMessages(locale);
  return `${diff.months} ${t.header.months} و ${diff.days} ${t.header.days}`;
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

  // SSR fetch با سشن
  const [user, subs] = await Promise.all([
    fetchUserInfo(),
    fetchUserSubscriptions().catch(() => [] as UserSubscription[]),
  ]);

  const validityText = validityTextFromSubs(locale, subs || []);
  const nRole = normalizeRole(roleSegment);
  const isWholesale = nRole === UserRole.Wholesaler;

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

      {/* Quick actions */}
      <AccountQuickActions
        role={nRole}
        roleSegment={roleSegment}
        locale={locale}
      />

      {/* List items */}
      <div className="mt-4 space-y-3">
        <AccountListItem
          href={`/${roleSegment}/likes`}
          title={t.list.likes}
          icon={HeartIcon}
        />
        {isWholesale && (
          <AccountListItem
            href={`/${roleSegment}/customers`}
            title={t.list.customers}
            icon={<span className="text-lg">👥</span>}
          />
        )}
        <AccountListItem
          href={`/${roleSegment}/transactions`}
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