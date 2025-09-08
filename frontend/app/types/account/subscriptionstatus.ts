// app/types/account/subscriptionStatus.ts
import type { AccountUser } from "@/app/types/account/account";

/** هم‌نام با ساختار JSON برگردانده‌شده از بک‌اند */
export interface SubscriptionStatusVM {
  cityId: number;
  city?: string | null;
  subscriptionId: number;
  expiresAt: string;    // ISO
  isActive: boolean;
  daysRemaining: number; // اگر منقضی شده = 0
  daysOverdue: number;   // اگر فعال است = 0
}

/** ریسپانس جدید fetch-user (بدون تغییر در امضای تابع موجود) */
export interface FetchUserInfoResponse {
  user: AccountUser;
  adminAccessInfo?: unknown | null;
  subscriptions: SubscriptionStatusVM[];
  hasActiveSubscription: boolean;
  activeCities: number[];
}
