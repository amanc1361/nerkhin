import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { encode } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { refreshAccessTokenAPI } from "@/app/services/authapi";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";

export const runtime = "nodejs";

// ---- helpers ----
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
}

function pickSessionCookieName(req: NextRequest) {
  return req.cookies.has("__Secure-next-auth.session-token")
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

// نوع JWT پروژه (با فیلدهای افزوده شده‌ی شما)
type AppJWT = JWT & {
  role: string | number;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  // اگر در پروژه تایپ اشتباهی دارید (accessTokenExpirests)، این فیلد را هم ست می‌کنیم:
  accessTokenExpirests?: number;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string | number | null;
  error?: string;
};

export async function POST(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("[force-refresh] Missing NEXTAUTH_SECRET");
    return NextResponse.json({ ok: false, error: "Missing NEXTAUTH_SECRET" }, { status: 500 });
  }

  // getToken از روی همین NextRequest کوکی رو می‌خونه
  const curr = await getToken({ req, secret }).catch((e) => {
    console.error("[force-refresh] getToken failed:", e);
    return null;
  });

  if (!curr || !(curr as any).refreshToken) {
    console.error("[force-refresh] No token/refreshToken in cookies");
    return NextResponse.json({ ok: false, error: "NoToken" }, { status: 401 });
  }

  try {
    // 1) توکن جدید از بک‌اند شما
    const r = await refreshAccessTokenAPI((curr as any).refreshToken as string);
    const absExp = Date.now() + r.accessTokenExpiresAt * 1000;

    // 2) ادعاهای فعلی از پروفایل (اختیاری اما مفید)
    let claims: { role?: any; subscriptionStatus?: any; subscriptionExpiresAt?: any } | null = null;
    try {
      claims = await fetchProfileByAccessToken(r.accessToken);
    } catch (e) {
      console.error("[force-refresh] profile fetch failed:", e);
    }

    // 3) ساخت JWT جدید (کاملاً منطبق با تایپ پروژه)
    const base = curr as AppJWT;
    const nextToken: AppJWT = {
      ...base,
      accessToken: r.accessToken,
      accessTokenExpires: absExp,
      accessTokenExpirests: absExp, // ← اگر augmentation‌تان این اشتباه تایپی را دارد
      refreshToken: base.refreshToken,
      role: (claims?.role ?? base.role) as any,
      subscriptionStatus: claims?.subscriptionStatus ?? base.subscriptionStatus ?? "none",
      subscriptionExpiresAt: claims?.subscriptionExpiresAt ?? base.subscriptionExpiresAt ?? null,
      error: undefined,
    };

    // 4) امضای JWT و ست کردن کوکی سشن NextAuth
    const jwt = await encode({ token: nextToken, secret }).catch((e) => {
      console.error("[force-refresh] encode failed:", e);
      throw e;
    });

    const res = NextResponse.json({ ok: true });
    const cookieName = pickSessionCookieName(req);
    const secure = cookieName.startsWith("__Secure-") || process.env.NODE_ENV === "production";

    res.cookies.set(cookieName, jwt, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure,
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e: any) {
    console.error("[force-refresh] refresh failed:", e?.message || e);
    return NextResponse.json({ ok: false, error: e?.message || "RefreshFailed" }, { status: 500 });
  }
}
