// lib/server/fetchProductinfo.ts
import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import type { ProductInfoViewModel } from "@/app/types/userproduct/ProductInfoViewModel";

/* ---------- URL helpers ---------- */
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

function joinUrl(base: string, path: string) {
  const b = (base || "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`.replace(/([^:]\/)\/+/g, "$1");
}

/* ---------- Auth header ---------- */
async function authHeader() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken as string | undefined;
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

/* ---------- JSON extractor با لاگ ---------- */
async function readJson<T>(res: Response): Promise<T> {
  const raw = await res.clone().text();

  // --- اینجا لاگ خام را می‌گیری ---
  // eslint-disable-next-line no-console
  console.log("[fetchProductInfoSSR] RAW response text:", raw);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}\n${raw}`);
  }

  let parsed: any;  
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Response is not valid JSON:\n" + raw);
  }

  // --- اینجا JSON پارس شده را هم لاگ می‌گیری ---
  // eslint-disable-next-line no-console
  console.log("[fetchProductInfoSSR] Parsed JSON:", parsed);

  return parsed as T;
}

/* ---------- SSR fetch (Protected) ---------- */
export async function fetchProductInfoSSR(
  productId: number,
  init?: RequestInit
): Promise<ProductInfoViewModel> {
  const headers = {
    ...(await authHeader()),
    ...(init?.headers || {}),
  };

  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, `/user-product/fetch-shops/${productId}`);

  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers,
  });

  return await readJson<ProductInfoViewModel>(res);
}
