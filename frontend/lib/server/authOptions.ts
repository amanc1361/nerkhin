// مسیر: lib/authOptions.ts

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCodeAPI, refreshAccessTokenAPI } from "@/app/services/authapi";
import type { User } from "next-auth";

// (دلخواه) تابع کمکی اگر جای دیگر لازم شد
export function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString();
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
       id: "credentials",
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code:  { label: "Code",  type: "text" },
      },
      
      async authorize(credentials) {
        console.log("get data from server.....................");
        if (!credentials?.phone || !credentials?.code)
          throw new Error("Phone & code required");
          console.log("🔐 AUTHORIZATION started");
        console.log("📱 Phone:", credentials?.phone);
        console.log("🔢 Code:", credentials?.code);
        const resp = await verifyCodeAPI(credentials.phone, credentials.code);
         console.log("✅ API Response:", resp);
        if (resp?.user && resp.accessToken && resp.user.role !== undefined) {
                    console.log("🟢 Login success:", resp.user.fullName, "| role:", resp.user.role);

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
            accessTokenExpires: resp.accessTokenExpiresAt * 1000, // به ms تبدیل می‌کنیم
          };
          return user;
        } else {
                 console.log("🔴 Login failed, response incomplete");
        }
        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages:   { signIn: "/auth/login" },
  secret:  process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      /* ورود اول */
      if (user) {
        token.id                 = user.id;
        token.role               = user.role;
        token.accessToken        = user.accessToken;
        token.refreshToken       = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        return token;
      }

      /* هنوز معتبر است؟ */
      if (Date.now() < (token.accessTokenExpires as number)) return token;

      /* نیاز به رفرش */
      try {
        const r = await refreshAccessTokenAPI(token.refreshToken as string);
        return {
          ...token,
          accessToken:        r.accessToken,
          accessTokenExpires: r.accessTokenExpiresAt * 1000,
          refreshToken:       token.refreshToken,
        };
      } catch {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    async session({ session, token }) {
      session.user.id     = token.id as string;
      session.user.role   = token.role;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};
