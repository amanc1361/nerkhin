// components/account/AccountQuickActions.tsx
"use client";


import { normalizeRole, RoleInput, UserRole } from "@/app/types/role";
import { getAccountMessages } from "@/lib/server/texts/accountMessages";
import { useRouter } from "next/navigation";

export default function AccountQuickActions({
  role,
  roleSegment, // 'wholesaler' | 'retailer'
  locale = "fa",
}: {
  role: RoleInput;
  roleSegment: "wholesaler" | "retailer";
  locale?: "fa" | "en";
}) {
  const t = getAccountMessages(locale);
  const nRole = normalizeRole(role);
  const isWholesale = nRole === UserRole.Wholesaler;
  const router = useRouter();

  return (
    <div className={`mt-4 grid gap-3 ${isWholesale ? "sm:grid-cols-2" : "grid-cols-1"}`}>
      {isWholesale && (
        <button
          className="rounded-xl bg-indigo-600 px-4 py-3 text-white hover:bg-indigo-700"
          onClick={() => router.push(`/${roleSegment}/account/edit`)}
        >
          ✏️ {t.actions.editShop}
        </button>
      )}
      <button
        className="rounded-xl bg-cyan-600 px-4 py-3 text-white hover:bg-cyan-700"
        onClick={() => router.push(`/${roleSegment}/account/extend`)}
      >
        🧾 {t.actions.extendAccount}
      </button>
    </div>
  );
}
