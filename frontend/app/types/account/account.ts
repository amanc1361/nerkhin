// app/types/account/account.ts

import { UserRole } from "../role";


/** همان ساختار decimal.NullDecimal سمت Go */
export type NullDecimal = { Decimal: string; Valid: boolean };
export type MaybeNullDecimal = NullDecimal | null | undefined;

/** اطلاعات کاربر + فیلدهای فروشگاه برای عمده‌فروش */
export interface AccountUser {
  id: number;
  fullName?: string;
  phone?: string;
  /** بک‌اند عدد برمی‌گرداند؛ برای سازگاری هر دو را می‌پذیریم */
  role?: UserRole | number;
  imageUrl?: string;

  // فقط برای عمده‌فروش
  shopName?: string;
  shopAddress?: string;
  shopPhone1?: string;
  shopPhone2?: string;
  shopPhone3?: string;
  instagramUrl?: string;
  telegramUrl?: string;
  whatsappUrl?: string;
  websiteUrl?: string;
  latitude?: MaybeNullDecimal;
  longitude?: MaybeNullDecimal;
}

/** اشتراک کاربر */
export interface UserSubscription {
  id: number;
  startAt?: string;
  endAt?: string; // تاریخ پایان برای محاسبه اعتبار
}
export interface FavoriteAccount {
  id: number;
  userId: number;
  targetUserId: number;
  createdAt?: string;
  updatedAt?: string;
};