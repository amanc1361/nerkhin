// lib/server/sunScriptionAction.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";

type HttpMethod = "GET" | "POST";

const clean = (s: string) => (s || "").replace(/\/+$/, "");
const isAbs = (s: string) => /^https?:\/\//i.test(s);
const withSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);

function resolveRootBase(publicBase: string, internalBase: string) {
  const pb = clean(publicBase || "/api/go");
  const ib = clean(internalBase || "");
  if (isAbs(pb)) return pb;
  if (!ib) return withSlash(pb);
  const tail = withSlash(pb);
  return ib.endsWith(tail) ? ib : ib + tail;
}

/** sFetch با هندل بدنه‌ی خالی/204 */
async function sFetch<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: any,
  init?: RequestInit
): Promise<T> {
  const session = await getServerSession(authOptions);
  const token =
    (session as any)?.user?.accessToken || (session as any)?.accessToken;

  const base = resolveRootBase(API_BASE_URL || "/api/go", INTERNAL_GO_API_URL || "");
  const url = `${base}${withSlash(path)}`;

  const headers: HeadersInit = {
    ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers ?? {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    cache: "no-store",
    ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} on ${path}: ${text}`);
  }

  const raw = await res.text().catch(() => "");
  if (!raw) return null as unknown as T;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
}

/* ---------- Types ---------- */
export type Subscription = {
  id: number;
  price: string;
  numberOfDays: number;
  createdAt: string;
  updatedAt: string;
};

export type PaymentGatewayInfo = {
  paymentUrl: string;
  authority: string;
};

export type UserSubscriptionVM = {
  id: number;
  userId: number;
  cityId: number;
  subscriptionId: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  price?: string;
  numberOfDays?: number;
};

/* ---------- SSR actions ---------- */
export async function fetchAllSubscriptionsSSR(): Promise<Subscription[]> {
  return sFetch<Subscription[]>("/subscription/all", "GET");
}

export async function fetchUserSubscriptionsByCitySSR(cityId: number): Promise<UserSubscriptionVM[]> {
  return sFetch<UserSubscriptionVM[]>(`/user-subscription/${cityId}`, "GET");
}

export async function fetchPaymentGatewayInfoSSR(input: {
  cityId: number;
  subscriptionId: number;
  callBackUrl: string;
}): Promise<PaymentGatewayInfo> {
  return sFetch<PaymentGatewayInfo>("/user-subscription/payment-gateway-info", "POST", {
    cityId: input.cityId,
    subscriptionId: input.subscriptionId,
    callBackUrl: input.callBackUrl,
  });
}

/**
 * تأیید/ثبت اشتراک بعد از پرداخت (Best-effort):
 * - 2xx (حتی 204/بدنه‌ی خالی) → موفق
 * - 409/208 → قبلاً تأیید شده (idempotent success)
 * - 400/422 → شکست واقعی (Authority/ورودی بد)
 * - سایر کدها → throw (شبکه/خطای داخلی)
 */
export async function createUserSubscriptionSSR(
  authority: string
): Promise<{ id?: number } | null> {
  if (!authority) throw new Error("authority is required");

  const session = await getServerSession(authOptions);
  const token =
    (session as any)?.user?.accessToken || (session as any)?.accessToken;

  const base = resolveRootBase(API_BASE_URL || "/api/go", INTERNAL_GO_API_URL || "");
  const url = `${base}/user-subscription/create`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({ authority }),
  });

  if (res.ok) {
    const txt = await res.text().catch(() => "");
    if (!txt) return null;
    try { return JSON.parse(txt); } catch { return null; }
  }

  if (res.status === 409 || res.status === 208) {
    return null; // idempotent success
  }

  if (res.status === 400 || res.status === 422) {
    const text = await res.text().catch(() => "");
    throw new Error(`verify_invalid:${text || res.status}`);
  }

  const text = await res.text().catch(() => "");
  throw new Error(`verify_failed:${res.status}:${text}`);
}

export async function fetchPaymentHistorySSR(): Promise<any[]> {
  return sFetch<any[]>("/user-subscription/fetch-payment-transactions-history", "GET");
}

export async function fetchUserSubscriptionListSSR(): Promise<any[]> {
  return sFetch<any[]>("/user-subscription/list", "GET");
}
