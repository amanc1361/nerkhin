// app/auth/refresh-bridge/RefreshBridgeClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RefreshBridgeClient() {
  const sp = useSearchParams();
  const { update } = useSession();
  const ran = useRef(false);
  const [msg, setMsg] = useState("در حال تازه‌سازی توکن…");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const next = sp.get("next") || "/";
    const fallback = sp.get("fallback") || "/account/subscriptions";

    (async () => {
      try {
        // کمی مکث کوتاه تا Verify بک‌اند قطعیت پیدا کند
        await new Promise((r) => setTimeout(r, 800));

        // ✅ فقط یک بار رفرش سشن/توکن
        const s = (await update()) as any;

        const ok =
          (s?.subscriptionStatus === "active" || s?.subscriptionStatus === "trial") &&
          !!s?.subscriptionExpiresAt &&
          new Date(s.subscriptionExpiresAt).getTime() > Date.now();

        // ۲۰۰ms مکث تا Set-Cookie ثبت شود، بعد «درخواست کامل» بزن که middleware کوکی تازه را بخواند
        await new Promise((r) => setTimeout(r, 200));

        if (ok) {
          setMsg("توکن تازه شد، در حال ادامه…");
          window.location.assign(next);       // فول‌ریدایرکت → middleware ادعاهای جدید را می‌بیند
        } else {
          setMsg("اشتراک هنوز فعال نیست؛ هدایت به صفحهٔ خرید…");
          window.location.replace(fallback);
        }
      } catch {
        window.location.replace(fallback);
      }
    })();
  }, [sp, update]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl p-8 shadow">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-blue-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">{msg}</p>
        </div>
      </div>
    </main>
  );
}
