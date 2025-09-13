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
  iosTip: "در Safari روی دکمهٔ اشتراک‌گذاری بزنید و «Add to Home Screen» را انتخاب کنید.",
  close: "بستن"
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS: navigator.standalone — Android/others: matchMedia
  // @ts-ignore
  return window.matchMedia?.("(display-mode: standalone)")?.matches || (window.navigator as any).standalone === true;
}

function getUAFlags() {
  if (typeof navigator === "undefined") {
    return { isMobile: false, isAndroid: false, isIOS: false };
  }
  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  // userAgentData (کروم‌های جدید)
  const isMobileByUAData = (navigator as any).userAgentData?.mobile === true;
  const isMobileByUA = /Android|iPhone|iPad|iPod/i.test(ua);
  const isMobile = isMobileByUAData || isMobileByUA;
  return { isMobile, isAndroid, isIOS };
}

export default function InstallPrompt({ messages = defaultMessages }: { messages?: Messages }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);

  const { isMobile, isAndroid, isIOS } = getUAFlags();
  const standalone = isStandalone();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = localStorage.getItem("pwa_installed") === "1";
    setAlreadyInstalled(flag);
  }, []);

  useEffect(() => {
    if (!isMobile || !isAndroid || standalone) return;
    if (alreadyInstalled) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isMobile, isAndroid, standalone, alreadyInstalled]);

  // iOS: فقط راهنما (beforeinstallprompt ندارد)
  useEffect(() => {
    if (!isMobile || !isIOS) return;
    if (standalone || alreadyInstalled) return;
    const t = setTimeout(() => setShowIOSHelp(true), 1500);
    return () => clearTimeout(t);
  }, [isMobile, isIOS, standalone, alreadyInstalled]);

  // اگر نصب شد، برای همیشه خاموش کن
  useEffect(() => {
    const onInstalled = () => {
      try {
        localStorage.setItem("pwa_installed", "1");
      } catch {}
      setDeferredPrompt(null);
      setShowIOSHelp(false);
      setAlreadyInstalled(true);
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const canShowInstall = useMemo(() => !!deferredPrompt, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
    }
  };

  // روی دسکتاپ مطلقاً هیچ UI نشان نده
  if (!isMobile) return null;
  // اگر در حالت standaloneایم یا قبلاً نصب شده، نشان نده
  if (standalone || alreadyInstalled) return null;

  return (
    <>
      {/* دکمه نصب فقط روی اندروید وقتی event آماده است */}
      {isAndroid && canShowInstall && (
        <button
          onClick={handleInstall}
          className="fixed z-[60] bottom-4 right-4 rounded-xl bg-blue-600 text-white px-4 py-2 shadow-lg hover:bg-blue-700 focus:outline-none"
        >
          {messages.install}
        </button>
      )}

      {/* راهنمای iOS */}
      {isIOS && showIOSHelp && (
        <div className="fixed z-[60] bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[360px] rounded-2xl bg-white/95 shadow-xl border border-slate-200 p-4 text-slate-800 backdrop-blur-sm">
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
