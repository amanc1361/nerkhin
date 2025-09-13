"use client";

import { useEffect } from "react";

export default function InitServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      // مسیر در public است → /sw.js
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          // console.log("Service Worker registered");
        })
        .catch(() => {
          // console.warn("Service Worker registration failed", err);
        });
    }
  }, []);
  return null;
}
