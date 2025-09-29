// app/api/session/force-refresh/route.ts
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

// مطابق types/next-auth.d.ts شما:
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

export async function POST(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing NEXTAUTH_SECRET" }, { status: 500 });
  }

  const curr = await getToken({ req, secret }).catch(() => null);
  if (!curr || !(curr as any).refreshToken) {
    return NextResponse.json({ ok: false, error: "NoToken" }, { status: 401 });
  }

  try {
    // 1) رفرش از بک‌اند خودت
    const r = await refreshAccessTokenAPI((curr as any).refreshToken as string);
    const absExp = Date.now() + r.accessTokenExpiresAt * 1000;

    // 2) پروفایل واقعی بعد از خرید
    const claims = await fetchProfileByAccessToken(r.accessToken);

    // 3) ساخت JWT جدید مطابق تایپ خودت
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

    // 4) امضا و نوشتن کوکی سشن NextAuth
    const jwt = await encode({ token: nextToken, secret });
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
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "RefreshFailed" }, { status: 500 });
  }
}
