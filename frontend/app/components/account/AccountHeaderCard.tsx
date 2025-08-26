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
  pin: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 10a3 3 0 110-6 3 3 0 010 6z"/>
    </svg>
  ),
  phone: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.2 11.7 11.7 0 003.7 1.2 1 1 0 01.8 1v3.4a1 1 0 01-1 1A17 17 0 013 6a1 1 0 011-1h3.4a1 1 0 011 .8 11.7 11.7 0 001.2 3.7 1 1 0 01-.2 1.1L6.6 10.8z"/>
    </svg>
  ),
  insta: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6-1a1 1 0 100 2 1 1 0 000-2z"/>
    </svg>
  ),
  tg: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.04 15.47l-.39 5.47c.56 0 .81-.24 1.1-.52l2.64-2.52 5.48 4c1.01.55 1.73.26 2-.94l3.63-17.03c.32-1.5-.54-2.09-1.53-1.73L1.28 9.63C-.18 10.19-.16 11.04 1 11.4l5.37 1.68L19.39 5.5c.64-.41 1.22-.19.74.22"/>
    </svg>
  ),
  web: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm0 18a8 8 0 118-8 8.009 8.009 0 01-8 8zm0-14a6 6 0 106 6 6.007 6.007 0 00-6-6z"/>
    </svg>
  ),
  wa: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.94 11.94 0 0012.01 0C5.38 0 .03 5.35.03 11.97a11.9 11.9 0 001.69 6.14L0 24l5.99-1.57A11.97 11.97 0 0012.03 24C18.66 24 24 18.63 24 12a11.94 11.94 0 00-3.48-8.52z"/>
    </svg>
  ),
};

export const AccountHeaderCard: FC<Props> = ({
  role,
  locale = "fa",
  user,
  validityText,
}) => {
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
    <section
      className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-[#EAD6FF] via-[#EFE7FF] to-[#E6F2FF] p-5 shadow-[0_12px_34px_-12px_rgba(109,40,217,.35)]"
    >
      {/* گرادینت تقویتی */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-36 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />

      {/* آواتار کاملاً بالا-راست (absolute) */}
      <div className="absolute right-5 top-5">
        <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-purple-300">
            <span>{user.imageUrl}</span>
          <Image
            src={"https://nerkhin.com/uploads/"+user.imageUrl+".webp" || "/uploads/avatar-placeholder.png"}
            alt={user.fullName || user.shopName || "avatar"}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      </div>

      {/* بدنه: راست‌چین زیر آواتار با فاصله سمت راست */}
      <div className="pr-20 text-right">
        {/* چیپ‌ها */}
        <div className="mb-2 inline-flex flex-wrap items-center gap-2">
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

        {/* نام‌ها */}
        <div className="text-sm font-semibold text-gray-900">
          {isWholesale ? user.shopName || user.fullName || "" : user.fullName || ""}
        </div>
        {isWholesale && user.fullName && (
          <div className="text-xs text-gray-500">{user.fullName}</div>
        )}

        {/* آدرس: راست‌چین، آیکن سمت راست متن */}
        {isWholesale && user.shopAddress && (
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-gray-700">
            <span className="text-gray-500">{Ic.pin}</span>
            <span className="truncate">{user.shopAddress}</span>
            {locHref && (
              <Link href={locHref} target="_blank" className="rounded-full bg-gray-100 p-1 text-gray-600 hover:text-gray-800" aria-label="location">
                {Ic.pin}
              </Link>
            )}
          </div>
        )}

        {/* تلفن‌ها: آیکن در راست‌ترین نقطه + شماره‌ها با جداکننده عمودی */}
        {isWholesale && phones.length > 0 && (
          <div className="mt-3 flex items-center justify-end gap-2 text-[13px] text-gray-900">
            {/* آیکن در راست */}
            <span className="text-gray-500">{Ic.phone}</span>
            {/* شماره‌ها کنار هم */}
            <div className="flex items-center">
              {phones.map((ph, i) => (
                <span key={i} className="flex items-center">
                  <a dir="ltr" href={`tel:${ph}`} className="hover:underline">
                    {ph}
                  </a>
                  {i < phones.length - 1 && (
                    <span className="mx-2 inline-block h-3 w-px bg-gray-300" />
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* شبکه‌های اجتماعی: وسط‌چینِ واقعی */}
      {isWholesale && (
        <div className="mt-4 flex items-center justify-center gap-10 text-gray-700">
          {user.instagramUrl && (
            <Link href={user.instagramUrl} target="_blank" className="grid h-9 w-9 place-items-center rounded-full bg-white/80 backdrop-blur hover:bg-white" aria-label="instagram">
              {Ic.insta}
            </Link>
          )}
          {user.telegramUrl && (
            <Link href={user.telegramUrl} target="_blank" className="grid h-9 w-9 place-items-center rounded-full bg-white/80 backdrop-blur hover:bg-white" aria-label="telegram">
              {Ic.tg}
            </Link>
          )}
          {user.websiteUrl && (
            <Link href={user.websiteUrl} target="_blank" className="grid h-9 w-9 place-items-center rounded-full bg-white/80 backdrop-blur hover:bg-white" aria-label="website">
              {Ic.web}
            </Link>
          )}
          {user.whatsappUrl && (
            <Link href={user.whatsappUrl} target="_blank" className="grid h-9 w-9 place-items-center rounded-full bg-white/80 backdrop-blur hover:bg-white" aria-label="whatsapp">
              {Ic.wa}
            </Link>
          )}
        </div>
      )}
    </section>
  );
};
