"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * صفحه آپلود CSV محصولات
 * نکات:
 * - category_id فقط از ستون «زیر دسته» داخل CSV خوانده می‌شود (سمت بک‌اند).
 * - گزینه skipExisting برای جلوگیری از درج تکراری براساس ID=نام پوشه.
 * - هدر Authorization به‌صورت خودکار از localStorage یا Cookie خوانده و اضافه می‌شود.
 * - credentials: "include" برای ارسال کوکی‌های سشن.
 */

type ImportResult = {
  total: number;
  inserted: number;
  skipped: number;
  failed: number;
  rowErrors?: { row: number; error: string }[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/go";
const IMPORT_ENDPOINT = `${API_BASE}/product/import-csv`;

/** خواندن توکن از localStorage یا Cookie و ساخت هدر Authorization */
function getAuthHeaders(): Record<string, string> {
  try {
    const tryKeys = ["access_token", "token", "auth_token", "jwt"] as const;
    let token: string | null = null;

    if (typeof window !== "undefined") {
      // 1) localStorage
      for (const k of tryKeys) {
        const v = window.localStorage.getItem(k);
        if (v && v.trim()) {
          token = v.replace(/^"|"$/g, "").trim();
          break;
        }
      }
      // 2) Cookie (fallback)
      if (!token && typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        for (const c of cookies) {
          const [ck, cv] = c.split("=");
          if (ck && cv && tryKeys.includes(ck.trim() as any)) {
            token = decodeURIComponent(cv.trim());
            break;
          }
        }
      }
    }

    if (token && !/^Bearer\s/i.test(token)) token = `Bearer ${token}`;
    return token ? { Authorization: token } : {};
  } catch {
    return {};
  }
}

export default function ImportProductsCSVPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [skipExisting, setSkipExisting] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);

    if (!file) {
      setErrorMsg("فایل CSV را انتخاب کنید.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("skipExisting", skipExisting ? "true" : "false");

      const headers: Record<string, string> = {
        Accept: "application/json",
        ...getAuthHeaders(),
      };

      const res = await fetch(IMPORT_ENDPOINT, {
        method: "POST",
        body: formData,
        credentials: "include", // کوکی‌های سشن هم ارسال شود
        headers,
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        const payload = contentType.includes("application/json")
          ? JSON.stringify(await res.json())
          : await res.text();
        throw new Error(
          `درخواست ناموفق (${res.status}): ${payload || "Unknown"}`
        );
      }

      const data: ImportResult = contentType.includes("application/json")
        ? await res.json()
        : ({} as ImportResult);

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err?.message || "خطای ناشناخته در آپلود");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold mb-1">آپلود CSV محصولات</h1>
      <p className="text-sm text-gray-600 mb-6">
        برای هر ردیف، ستون <strong>«زیر دسته»</strong> باید شامل{" "}
        <strong>category_id</strong> معتبر باشد. این مقدار فقط از CSV خوانده
        می‌شود و از روت/فرم ارسال نمی‌گردد.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">فایل CSV</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full border rounded p-2"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            ستون‌های لازم: «زیر دسته»، «برند»، «مدل»، «نام پوشه»، «تعداد عکس».
            (اختیاری: «توضیحات»، «تگ»)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="skipExisting"
            type="checkbox"
            checked={skipExisting}
            onChange={(e) => setSkipExisting(e.target.checked)}
          />
          <label htmlFor="skipExisting">رد کردن محصولاتِ موجود (پیش‌فرض)</label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
          >
            {submitting ? "در حال ارسال..." : "آپلود و درج"}
          </button>

        <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded border"
          >
            بازگشت
          </button>
        </div>
      </form>

      {errorMsg ? (
        <div className="mt-6 p-3 rounded bg-red-50 border border-red-200 text-red-700">
          {errorMsg}
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-3">
          <div className="p-3 rounded bg-green-50 border border-green-200">
            <div>کل ردیف‌ها: {result.total ?? 0}</div>
            <div>درج‌شده: {result.inserted ?? 0}</div>
            <div>ردشده (موجود): {result.skipped ?? 0}</div>
            <div>ناموفق: {result.failed ?? 0}</div>
          </div>

          {result.rowErrors && result.rowErrors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full mt-2 border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left">ردیف</th>
                    <th className="border px-2 py-1 text-left">خطا</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rowErrors.map((re, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{re.row}</td>
                      <td className="border px-2 py-1 whitespace-pre-wrap">
                        {re.error}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
