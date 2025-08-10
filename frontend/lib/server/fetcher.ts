import { getSession } from "next-auth/react";
import Router from "next/router";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const session = await getSession();
  const headers = new Headers(init.headers);

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`,
    {
      ...init,
      headers,
      credentials: "include",
    }
  );

  // هر 401 → به لاگین با reauth=1
  if (res.status === 401) {
    Router.push("/auth/login?reauth=1");
    return Promise.reject(new Error("Unauthorized"));
  }

  return res;
}
