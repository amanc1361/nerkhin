// مسیر: lib/api/fetcher.ts
import { getSession } from "next-auth/react";
import Router from "next/router";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const session = await getSession();
  const headers = new Headers(init.headers);

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  /* اگر 401 شد → ساین‌اوت */
  if (res.status === 401) {
    Router.push("/auth/login");
    return Promise.reject(new Error("Unauthorized"));
  }
  return res;
}
