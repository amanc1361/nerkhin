// components/account/AccountHeaderCard.tsx
import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { normalizeRole, RoleInput, UserRole } from "@/app/types/role";
import { AccountUser } from "@/app/types/account/account";
import { getAccountMessages } from "@/lib/server/texts/accountMessages";

/**
 * کارت بالای صفحه «حساب من»
 * - برای خرده‌فروش: نام کاربر + نقش + اعتبار حساب
 * - برای عمده‌فروش: نام/نام فروشگاه + نقش + اعتبار + آدرس + تلفن‌ها + شبکه‌های اجتماعی
 */
type Props = {
  locale?: "fa" | "en";
  role: RoleInput;
  user: Pick<
    AccountUser,
    | "fullName"
    | "imageUrl"
    | "shopName"
    | "shopAddress"
    | "shopPhone1"
    | "shopPhone2"
    | "shopPhone3"
    | "instagramUrl"
    | "telegramUrl"
    | "whatsappUrl"
    | "websiteUrl"
    | "latitude"
    | "longitude"
  >;
  /** مثل: "12 ماه و 15 روز" – اگر نداشته باشیم، بجای آن پیام «اشتراک فعالی…» نشان داده می‌شود */
  validityText?: string;
};

const Icon = {
  location: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
  ),
  instagram: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6-1a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
  ),
  telegram: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.04 15.47l-.39 5.47c.56 0 .81-.24 1.1-.52l2.64-2.52 5.48 4c1.01.55 1.73.26 2-.94l3.63-17.03c.32-1.5-.54-2.09-1.53-1.73L1.28 9.63C-.18 10.19-.16 11.04 1 11.4l5.37 1.68L19.39 5.5c.64-.41 1.22-.19.74.22" />
    </svg>
  ),
  website: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm0 18a8 8 0 118-8 8.009 8.009 0 01-8 8zm0-14a6 6 0 106 6 6.007 6.007 0 00-6-6z" />
    </svg>
  ),
  whatsapp: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.94 11.94 0 0012.01 0C5.38 0 .03 5.35.03 11.97a11.9 11.9 0 001.69 6.14L0 24l5.99-1.57A11.97 11.97 0 0012.03 24C18.66 24 24 18.63 24 12a11.94 11.94 0 00-3.48-8.52zM12.02 22c-1.84 0-3.65-.49-5.23-1.42l-.38-.22-3.56.93.95-3.47-.24-.36A9.98 9.98 0 012.03 12C2.02 6.49 6.5 2 12.01 2 17.5 2 22 6.49 22 11.99 22 17.5 17.53 22 12.02 22z" />
    </svg>
  ),
};

export const AccountHeaderCard: FC<Props> = ({ role, locale = "fa", user, validityText }) => {
  const t = getAccountMessages(locale);
  const nRole = normalizeRole(role);
  const roleLabel =
    nRole === UserRole.Wholesaler ? t.header.roleWholesale :
    nRole === UserRole.Retailer   ? t.header.roleRetail   : "";

  const isWholesale = nRole === UserRole.Wholesaler;

  const hasGeo = Boolean(user.latitude && user.latitude.Valid && user.longitude && user.longitude.Valid);
  const locHref = hasGeo
    ? `https://maps.google.com/?q=${user.latitude!.Decimal},${user.longitude!.Decimal}`
    : undefined;

  const phones = [user.shopPhone1, user.shopPhone2, user.shopPhone3].filter(Boolean) as string[];

  return (
    <section className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-purple-200">
          <Image
            src={user.imageUrl || "/images/avatar-placeholder.png"}
            alt={user.fullName || user.shopName || "avatar"}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>

        {/* Body */}
        <div className="flex-1">
          {/* Badge + Validity */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
              {t.header.badgeText(roleLabel)}
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

          {/* Title (shopName for wholesaler, else fullName) */}
          <div className="mt-2 text-sm font-medium">
            {isWholesale ? (user.shopName || user.fullName || "") : (user.fullName || "")}
          </div>

          {/* Address + map (wholesaler only) */}
          {isWholesale && user.shopAddress && (
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
              <span>{user.shopAddress}</span>
              {locHref && (
                <Link
                  href={locHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-800"
                  aria-label="location"
                >
                  {Icon.location}
                </Link>
              )}
            </div>
          )}

          {/* Phones + socials (wholesaler only) */}
          {isWholesale && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {phones.map((ph, i) => (
                <a
                  key={i}
                  href={`tel:${ph}`}
                  className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
                >
                  {ph}
                </a>
              ))}

              <div className="ms-auto flex items-center gap-3 text-gray-600">
                {user.instagramUrl && (
                  <Link href={user.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="instagram" className="hover:text-gray-800">
                    {Icon.instagram}
                  </Link>
                )}
                {user.telegramUrl && (
                  <Link href={user.telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="telegram" className="hover:text-gray-800">
                    {Icon.telegram}
                  </Link>
                )}
                {user.websiteUrl && (
                  <Link href={user.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label="website" className="hover:text-gray-800">
                    {Icon.website}
                  </Link>
                )}
                {user.whatsappUrl && (
                  <Link href={user.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="whatsapp" className="hover:text-gray-800">
                    {Icon.whatsapp}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
