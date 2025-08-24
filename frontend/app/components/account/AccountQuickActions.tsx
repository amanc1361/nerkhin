// components/account/AccountQuickActions.tsx
"use client";


import { normalizeRole, RoleInput, UserRole } from "@/app/types/role";
import { getAccountMessages } from "@/lib/server/texts/accountMessages";
import { useRouter } from "next/navigation";

const Ic = {
  edit:   <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  bill:   <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H8a2 2 0 00-2 2v16l5-2 5 2 5-2V4a2 2 0 00-2-2z"/></svg>,
};

export default function AccountQuickActions({
  role,
  roleSegment,
  locale = "fa",
}: {
  role: RoleInput;
  roleSegment: "wholesaler" | "retailer";
  locale?: "fa" | "en";
}) {
  const t = getAccountMessages(locale);
  const isWholesale = normalizeRole(role) === UserRole.Wholesaler;
  const router = useRouter();

  return (
    <div className={`mt-4 grid gap-3 ${isWholesale ? "sm:grid-cols-2" : ""}`}>
      {isWholesale && (
        <button
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#5b4bf3] px-4 py-3 text-white shadow-[0_10px_20px_-10px_rgba(91,75,243,.7)] hover:brightness-110"
          onClick={() => router.push(`/${roleSegment}/account/edit`)}
        >
          {Ic.edit} {t.actions.editShop}
        </button>
      )}
      <button
        className="flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-white shadow-[0_10px_20px_-10px_rgba(13,148,136,.6)] hover:brightness-110"
        onClick={() => router.push(`/${roleSegment}/account/extend`)}
      >
        {Ic.bill} {t.actions.extendAccount}
      </button>
    </div>
  );
}
