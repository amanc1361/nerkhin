// app/[role]/account/edit/page.tsx
import { notFound } from "next/navigation";

import { fetchUserInfo } from "@/lib/server/server-api";
import { normalizeRole, UserRole } from "@/app/types/role";
import { AccountUser } from "@/app/types/account/account";
import { getShopEditMessages } from "@/lib/server/texts/shopEditMessages";
import ShopEditForm from "@/app/components/account/ShopEditform";




export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditShopPage(
  { params }: { params: Promise<{ role: string }> }
) {
  const { role } = await params;
  const roleSegment = role === "wholesaler" ? "wholesaler" : "retailer";
  const nRole = normalizeRole(roleSegment);
  if (nRole !== UserRole.Wholesaler) notFound(); // فقط عمده‌فروش

  const locale: "fa" | "en" = "fa";
  const t = getShopEditMessages(locale);

  const user = (await fetchUserInfo()) as AccountUser;

  return (
    <main className="mx-auto max-w-screen-sm px-3 py-4">
      <h1 className="mb-3 text-base font-semibold">{t.title}</h1>
      <ShopEditForm locale={locale} t={t} user={user} />
    </main>
  );
}
