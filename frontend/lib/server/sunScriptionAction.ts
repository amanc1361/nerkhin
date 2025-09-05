// lib/server/subscriptionActions.ts
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

async function sFetch<T>(path: string, method: HttpMethod = "GET", body?: any, init?: RequestInit): Promise<T> {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.user?.accessToken || (session as any)?.accessToken;

  const base = resolveRootBase(API_BASE_URL || "/api/go", INTERNAL_GO_API_URL || "");
  const url = `${base}${withSlash(path)}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    cache: "no-store",
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} on ${path}: ${text}`);
  }
  return res.json();
}

/* ---------- Types بر اساس بک‌اند ---------- */
export type Subscription = {
  id: number;
  price: string;            // decimal به‌صورت string
  numberOfDays: number;     // enum
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

/* ---------- اکشن‌های SSR ---------- */
export async function fetchAllSubscriptionsSSR(): Promise<Subscription[]> {
  return sFetch<Subscription[]>("/subscription/all", "GET");
}

export async function fetchUserSubscriptionsByCitySSR(cityId: number): Promise<UserSubscriptionVM[]> {
  return sFetch<UserSubscriptionVM[]>(`/user-subscription/${cityId}`, "GET");
}

export async function fetchPaymentGatewayInfoSSR(input: { cityId: number; subscriptionId: number; callBackUrl: string; }): Promise<PaymentGatewayInfo> {
  return sFetch<PaymentGatewayInfo>("/user-subscription/payment-gateway-info", "POST", {
    cityId: input.cityId,
    subscriptionId: input.subscriptionId,
    callBackUrl: input.callBackUrl,
  });
}

export async function createUserSubscriptionSSR(authority: string): Promise<{ id: number }> {
  return sFetch<{ id: number }>("/user-subscription/create", "POST", { authority });
}

export async function fetchPaymentHistorySSR(): Promise<any[]> {
  return sFetch<any[]>("/user-subscription/fetch-payment-transactions-history", "GET");
}

export async function fetchUserSubscriptionListSSR(): Promise<any[]> {
  return sFetch<any[]>("/user-subscription/list", "GET");
}
