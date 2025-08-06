// lib/server/serverApiService.ts
import "server-only";
import { getServerSession } from "next-auth";
import { INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import { authOptions } from "./authOptions";

async function serverFetch(url: string, options: RequestInit = {}) {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // 🔑 همیشه URL کامل می‌سازیم
  const fullUrl = url.startsWith("http") ? url : `${INTERNAL_GO_API_URL}${url}`;

  const response = await fetch(fullUrl, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error(`Server-side API Error → ${fullUrl}`, {
      status: response.status,
      body: errorBody,
    });
    throw new Error(`API request failed with status ${response.status}`);
  }

  if (response.status === 204 || !+response.headers.get("content-length")!) {
    return null;
  }
  return response.json();
}

export const serverApiService = {
  get:  <T = any>(url: string, opts: RequestInit = {}) =>
    serverFetch(url, { ...opts, method: "GET" }) as Promise<T>,
  post: <T = any>(url: string, body: Record<string, any>, opts: RequestInit = {}) =>
    serverFetch(url, { ...opts, method: "POST", body: JSON.stringify(body) }) as Promise<T>,
};
