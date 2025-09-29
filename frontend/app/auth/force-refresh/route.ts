// app/api/auth/force-refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { encode } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { refreshAccessTokenAPI } from "@/app/services/authapi";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";

export const runtime = "nodejs";

/* ---------- helpers ---------- */
const clean = (s: string) => (s || "").replace(/\/+$/, "");
const isAbs = (s: string) => /^https?:\/\//i.test(s);
const withSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);
function resolveBase(publicBase?: string, internalBase?: string) {
  const pb = clean(publicBase || "/api/go");
  const ib = clean(internalBase || "");
  if (isAbs(pb)) return pb;
  if (!ib) return withSlash(pb);
  const tail = withSlash(pb);
  return ib.endsWith(tail) ? ib : ib + tail;
}

async function fetchProfileByAccessToken(accessToken: string) {
  try {
    const base = resolveBase(API_BASE_URL, INTERNAL_GO_API_URL);
    const url = `${base}/user/fetch-user`;
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data) return null;
    return {
      role: (data as any)?.role,
      subscriptionStatus: (data as any)?.subscriptionStatus,
      subscriptionExpiresAt: (data as any)?.subscriptionExpiresAt ?? null,
    };
  } catch {
    return null;
  }
}

function pickSessionCookieName(req: NextRequest) {
  return req.cookies.has("__Secure-next-auth.session-token")
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

type AppJWT = JWT & {
  id?: string;
  role: string | number;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string | number | null;
  error?: "RefreshAccessTokenError";
};

async function buildRefreshedResponse(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing NEXTAUTH_SECRET" }, { status: 500 });
  }

  const curr = await getToken({ req, secret }).catch(() => null);
  if (!curr || !(curr as any).refreshToken) {
    return NextResponse.json({ ok: false, error: "NoToken" }, { status: 401 });
  }

  // 1) از بک‌اند توکن تازه بگیر
  const r = await refreshAccessTokenAPI((curr as any).refreshToken as string);
  const absExp = Date.now() + r.accessTokenExpiresAt * 1000;

  // 2) ادعاهای جدید را از پروفایل خودت بخوان (role/subscription …)
  const claims = await fetchProfileByAccessToken(r.accessToken);

  // 3) JWT جدید مطابق تایپ‌های پروژه
  const base = curr as AppJWT;
  const nextToken: AppJWT = {
    ...base,
    accessToken: r.accessToken,
    accessTokenExpires: absExp,
    refreshToken: base.refreshToken,
    role: (claims?.role ?? base.role) as any,
    subscriptionStatus: claims?.subscriptionStatus ?? base.subscriptionStatus ?? "none",
    subscriptionExpiresAt: claims?.subscriptionExpiresAt ?? base.subscriptionExpiresAt ?? null,
    error: undefined,
  };

  const jwt = await encode({ token: nextToken, secret });

  // 4) کوکی سشن NextAuth را ست کن
  const cookieName = pickSessionCookieName(req);
  const secure = cookieName.startsWith("__Secure-") || process.env.NODE_ENV === "production";

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, jwt, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}

/* ---------- POST ---------- */
export async function POST(req: NextRequest) {
  try {
    return await buildRefreshedResponse(req);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "RefreshFailed" }, { status: 500 });
  }
}

/* ---------- GET: برای تست و استفادهٔ ساده ---------- */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/";
  const fallback = url.searchParams.get("fallback") || "/auth/login?reauth=1";

  try {
    const baseRes = await buildRefreshedResponse(req);
    const ok = baseRes.status >= 200 && baseRes.status < 300;

    // redirect 303 به مقصد، و کپی‌کردن Set-Cookie
    const out = NextResponse.redirect(new URL(ok ? next : fallback, url), { status: 303 });
    const setCookie = baseRes.headers.get("set-cookie");
    if (setCookie) out.headers.set("set-cookie", setCookie);
    return out;
  } catch {
    return NextResponse.redirect(new URL(fallback, req.url), { status: 303 });
  }
}
