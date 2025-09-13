"use client";

import { useEffect, useMemo, useState } from "react";

type Messages = {
  install: string;
  iosTitle: string;
  iosTip: string;
  close: string;
};

const defaultMessages: Messages = {
  install: "نصب اپلیکیشن",
  iosTitle: "نصب در iOS",
  iosTip: "برای نصب در iOS از Safari روی دکمهٔ اشتراک‌گذاری بزنید و «Add to Home Screen» را انتخاب کنید.",
  close: "بستن",
};

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  // iOS: window.navigator.standalone
  // دیگر پلتفرم‌ها: matchMedia
  if (typeof window === "undefined") return false;
  // @ts-ignore
  return window.matchMedia?.("(display-mode: standalone)")?.matches || (window.navigator as any).standalone === true;
}

export default function InstallPrompt({ messages = defaultMessages }: { messages?: Messages }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  // اندروید/کروم
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // iOS راهنما
  useEffect(() => {
    if (isIOS() && !isInStandaloneMode()) {
      // کمی تاخیر تا مزاحم UX اولیه نشه
      const t = setTimeout(() => setShowIOSHelp(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  const canShowInstall = useMemo(() => !!deferredPrompt, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <>
      {canShowInstall && (
        <button
          onClick={handleInstall}
          className="fixed z-50 bottom-4 right-4 rounded-xl bg-blue-600 text-white px-4 py-2 shadow-lg hover:bg-blue-700 focus:outline-none"
        >
          {messages.install}
        </button>
      )}

      {showIOSHelp && (
        <div className="fixed z-50 bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[360px] rounded-2xl bg-white/95 shadow-xl border border-slate-200 p-4 text-slate-800 backdrop-blur-sm">
          <div className="font-bold mb-2">{messages.iosTitle}</div>
          <p className="text-sm leading-6">{messages.iosTip}</p>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => setShowIOSHelp(false)}
              className="px-3 py-1 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
            >
              {messages.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
