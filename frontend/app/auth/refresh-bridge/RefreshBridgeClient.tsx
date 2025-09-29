"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function RefreshBridgeClient() {
  const sp = useSearchParams();
  const ran = useRef(false);
  const [msg, setMsg] = useState("در حال تازه‌سازی توکن…");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const next = sp.get("next") || "/";
    const fallback = sp.get("fallback") || "/account/subscriptions";

    (async () => {
      try {
        await new Promise((r) => setTimeout(r, 600)); // فرصت به Verify
        const res = await fetch("/api/auth/force-refresh", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        await new Promise((r) => setTimeout(r, 150)); // ثبت Set-Cookie

        if (res.ok) {
          setMsg("اطلاعات کاربر به روز رسانی شد");
          window.location.assign(next); // درخواست کامل → middleware کوکی جدید را می‌خواند
        } else {
          setMsg("تازه‌سازی ناموفق؛ رفتن به اشتراک…");
          window.location.replace(fallback);
        }
      } catch {
        window.location.replace(fallback);
      }
    })();
  }, [sp]);

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
