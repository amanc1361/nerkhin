// مسیر: lib/server/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCodeAPI, refreshAccessTokenAPI } from "@/app/services/authapi";
import type { User } from "next-auth";

// کمکى کوچک براى JWT-های Paseto یا …
export function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return payload ?? null;
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code:  { label: "Code",  type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code)
          throw new Error("Phone & code required");
         try {
        const resp = await verifyCodeAPI(credentials.phone, credentials.code);
        console.log("✅ verifyCodeAPI →", resp);
        if (resp?.user && resp.accessToken && resp.user.role !== undefined) { 
          const ttlSec = resp.accessTokenExpiresAt;        // ← عددى که سرور برمى‌گرداند (ثانیه)
          const absExp = Date.now() + ttlSec * 1000;       // ← تبدیل به timestamp مطلق

          const user: User & {
            accessToken: string;
            refreshToken: string;
            accessTokenExpires: number;
            role: string | number;
          } = {
            id:   String(resp.user.id),
            name: resp.user.fullName,
            role: resp.user.role,
            accessToken:        resp.accessToken,
            refreshToken:       resp.refreshToken,
            accessTokenExpires: absExp,
          };

          return user;
        }  }
        catch (err) {
            console.error("🔴 verifyCodeAPI FETCH FAILED:", err);
        }
        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages:   { signIn: "/auth/login" },
  secret:  process.env.NEXTAUTH_SECRET,

  callbacks: {
    /** هر بار که توکن ساخته یا خوانده می‌شود */
    async jwt({ token, user }) {
      /* ورود اولیه */
      if (user) {
        token.id                 = user.id;
        token.role               = user.role;
        token.accessToken        = user.accessToken;
        token.refreshToken       = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        return token;
      }

      /* اگر هنوز ≥۵ دقیقه تا انقضا مانده، همان را برگردان */
      if (
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires - 5 * 60_000
      ) {
        return token;
      }

      /* رفرش توکن */
      try {
        const r = await refreshAccessTokenAPI(token.refreshToken as string);
        const absExp = Date.now() + r.accessTokenExpiresAt * 1000;

        return {
          ...token,
          accessToken:        r.accessToken,
          accessTokenExpires: absExp,
          refreshToken:       token.refreshToken, // ممکن است سرور refreshToken جدید ندهد
        };
      } catch (err) {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    /** دادهٔ سشن که به کلاینت می‌رود */
    async session({ session, token }) {
      session.user.id     = token.id as string;
      session.user.role   = token.role;
      session.accessToken = token.accessToken as string;
      session.error       = (token as any).error ?? undefined;
      return session;
    },
  },
};
