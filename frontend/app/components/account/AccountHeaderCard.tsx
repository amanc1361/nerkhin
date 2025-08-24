// components/account/AccountHeaderCard.tsx
import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { normalizeRole, RoleInput, UserRole } from "@/app/types/role";
import { AccountUser } from "@/app/types/account/account";
import { getAccountMessages } from "@/lib/server/texts/accountMessages";


type Props = {
  locale?: "fa" | "en";
  role: RoleInput;
  user: Pick<
    AccountUser,
    | "fullName" | "imageUrl"
    | "shopName" | "shopAddress"
    | "shopPhone1" | "shopPhone2" | "shopPhone3"
    | "instagramUrl" | "telegramUrl" | "whatsappUrl" | "websiteUrl"
    | "latitude" | "longitude"
  >;
  validityText?: string;
};

const Ic = {
  pin:   <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 10a3 3 0 110-6 3 3 0 010 6z"/></svg>,
  phone: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.2 11.7 11.7 0 003.7 1.2 1 1 0 01.8 1v3.4a1 1 0 01-1 1A17 17 0 013 6a1 1 0 011-1h3.4a1 1 0 011 .8 11.7 11.7 0 001.2 3.7 1 1 0 01-.2 1.1L6.6 10.8z"/></svg>,
  insta: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6-1a1 1 0 100 2 1 1 0 000-2z"/></svg>,
  tg:    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9.04 15.47l-.39 5.47c.56 0 .81-.24 1.1-.52l2.64-2.52 5.48 4c1.01.55 1.73.26 2-.94l3.63-17.03c.32-1.5-.54-2.09-1.53-1.73L1.28 9.63C-.18 10.19-.16 11.04 1 11.4l5.37 1.68L19.39 5.5c.64-.41 1.22-.19.74.22"/></svg>,
  web:   <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm0 18a8 8 0 118-8 8.009 8.009 0 01-8 8zm0-14a6 6 0 106 6 6.007 6.007 0 00-6-6z"/></svg>,
  wa:    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.94 11.94 0 0012.01 0C5.38 0 .03 5.35.03 11.97a11.9 11.9 0 001.69 6.14L0 24l5.99-1.57A11.97 11.97 0 0012.03 24C18.66 24 24 18.63 24 12a11.94 11.94 0 00-3.48-8.52z"/></svg>,
};

export const AccountHeaderCard: FC<Props> = ({ role, locale = "fa", user, validityText }) => {
  const t = getAccountMessages(locale);
  const nRole = normalizeRole(role);
  const isWholesale = nRole === UserRole.Wholesaler;
  const roleLabel =
    nRole === UserRole.Wholesaler ? t.header.roleWholesale :
    nRole === UserRole.Retailer   ? t.header.roleRetail   : "";

  const locHref =
    user.latitude?.Valid && user.longitude?.Valid
      ? `https://maps.google.com/?q=${user.latitude?.Decimal},${user.longitude?.Decimal}`
      : undefined;

  const phones = [user.shopPhone1, user.shopPhone2, user.shopPhone3].filter(Boolean) as string[];

  return (
    <section className="relative rounded-3xl border border-purple-200/70 bg-gradient-to-b from-purple-50 via-white to-white p-4 shadow-[0_8px_24px_-8px_rgba(109,40,217,.25)]">
      <span className="pointer-events-none absolute inset-x-3 top-2 h-1 rounded-full bg-purple-100/60" />
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-purple-300">
          <Image
            src={user.imageUrl || "/images/avatar-placeholder.png"}
            alt={user.fullName || user.shopName || "avatar"}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
              فروشگاه | {roleLabel}
            </span>
            {validityText ? (
              <span className="inline-flex items-center rounded-full bg-cyan-50 px-2 py-1 text-xs text-cyan-700">
                {t.header.validityPrefix} {validityText}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">
                {t.empty.noSubscription}
              </span>
            )}
          </div>

          <div className="mt-2 text-sm font-semibold text-gray-800 truncate">
            {isWholesale ? (user.shopName || user.fullName || "") : (user.fullName || "")}
          </div>
          {isWholesale && user.fullName && (
            <div className="text-xs text-gray-500 truncate">{user.fullName}</div>
          )}

          {/* آدرس */}
          {isWholesale && user.shopAddress && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
              <span className="text-gray-500">{Ic.pin}</span>
              <span className="truncate">{user.shopAddress}</span>
              {locHref && (
                <Link href={locHref} target="_blank" className="ms-1 rounded-full bg-gray-100 p-1 text-gray-600 hover:text-gray-800" aria-label="location">
                  {Ic.pin}
                </Link>
              )}
            </div>
          )}

          {/* تلفن‌ها: یک ردیف، با جداکننده عمودی */}
          {isWholesale && phones.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-[13px] text-gray-800 overflow-x-auto">
              <span className="text-gray-500">{Ic.phone}</span>
              <div className="flex items-center">
                {phones.map((ph, i) => (
                  <span key={i} className="flex items-center">
                    <a href={`tel:${ph}`} className="hover:underline">{ph}</a>
                    {i < phones.length - 1 && (
                      <span className="mx-2 inline-block h-4 w-px bg-gray-300" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* شبکه‌های اجتماعی */}
          {isWholesale && (
            <div className="mt-3 flex items-center gap-3 text-gray-600">
              {user.whatsappUrl && (
                <Link href={user.whatsappUrl} target="_blank" className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 hover:bg-gray-200" aria-label="whatsapp">
                  {Ic.wa}
                </Link>
              )}
              {user.instagramUrl && (
                <Link href={user.instagramUrl} target="_blank" className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 hover:bg-gray-200" aria-label="instagram">
                  {Ic.insta}
                </Link>
              )}
              {user.telegramUrl && (
                <Link href={user.telegramUrl} target="_blank" className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 hover:bg-gray-200" aria-label="telegram">
                  {Ic.tg}
                </Link>
              )}
              {user.websiteUrl && (
                <Link href={user.websiteUrl} target="_blank" className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 hover:bg-gray-200" aria-label="website">
                  {Ic.web}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
