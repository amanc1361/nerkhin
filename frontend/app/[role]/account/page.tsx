// app/[role]/account/page.tsx

import { AccountHeaderCard } from "@/app/components/account/AccountHeaderCard";
import AccountListItem from "@/app/components/account/AccountListItem";
import AccountQuickActions from "@/app/components/account/AccountQuickActions";
import { UserSubscription } from "@/app/types/account/account";
import { normalizeRole, UserRole } from "@/app/types/role";
import {
  fetchUserInfo,
  fetchUserSubscriptions,

} from "@/lib/server/server-api";
import { getAccountMessages } from "@/lib/server/texts/accountMessages";


export const dynamic = "force-dynamic";
export const revalidate = 0;

function toMonthDayDiff(now: Date, end?: string | null) {
  if (!end) return null;
  const endDt = new Date(end);
  const ms = endDt.getTime() - now.getTime();
  if (Number.isNaN(ms) || ms <= 0) return null;
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

export default async function AccountPage(
   { params }: { params: Promise<{ role: string }> } // ✅ سازگار با Next 15
) {
  const { role } = await params;

  const roleSegment = (role === "wholesaler" ? "wholesaler" : "retailer") as
    | "wholesaler"
    | "retailer";

  const locale: "fa" | "en" = "fa";
  const t = getAccountMessages(locale);

  const [user, subs] = await Promise.all([
    fetchUserInfo(),
    fetchUserSubscriptions().catch(() => [] as UserSubscription[]),
  ]);

  const validityText = validityTextFromSubs(locale, subs || []);
  const nRole = normalizeRole(roleSegment);
  const isWholesale = nRole === UserRole.Wholesaler;

  return (
    <main className="mx-auto max-w-screen-sm px-3 py-4">
      <AccountHeaderCard
        role={nRole}
        locale={locale}
        user={{
          fullName: user.fullName,
          imageUrl: user.imageUrl,
          // فروشگاه برای عمده‌فروش
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

      <AccountQuickActions role={nRole} roleSegment={roleSegment} locale={locale} />

      <div className="mt-4 space-y-3">
        <AccountListItem
          href={`/${roleSegment}/likes`}
          title={t.list.likes}
          icon={<span>⭐</span>}
        />
        {isWholesale && (
          <AccountListItem
            href={`/${roleSegment}/customers`}
            title={t.list.customers}
            icon={<span>👥</span>}
          />
        )}
        <AccountListItem
          href={`/${roleSegment}/transactions`}
          title={t.list.transactions}
          icon={<span>💳</span>}
        />
        <AccountListItem
          href={`/rules`}
          title={t.list.rules}
          icon={<span>📘</span>}
        />
      </div>
    </main>
  );
}
