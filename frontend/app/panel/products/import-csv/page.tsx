"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * این صفحه یک فرم ساده برای آپلود CSV می‌دهد و فرم‌دیتا را
 * به اندپوینت بک‌اند POST می‌کند:
 *   POST ${API_BASE}/v1/products/import-csv
 *
 * نکته:
 * - API_BASE از NEXT_PUBLIC_API_BASE_URL گرفته می‌شود (پیش‌فرض "/api/go").
 * - هدر Content-Type رو دستی ست نکن؛ خود مرورگر برای FormData تنظیم می‌کند.
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
const IMPORT_ENDPOINT = `${API_BASE}/v1/products/import-csv`;

export default function ImportProductsCSVPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");
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

      // پارامترهای اختیاری
      if (categoryId.trim()) {
        formData.append("categoryId", categoryId.trim());
      }
      formData.append("skipExisting", skipExisting ? "true" : "false");

      const res = await fetch(IMPORT_ENDPOINT, {
        method: "POST",
        body: formData,
        // برای ارسال کوکی‌ها (سشن لاگین):
        credentials: "include",
        // Accept برای جواب JSON
        headers: {
          Accept: "application/json",
        },
      });

      const isJson =
        res.headers.get("content-type")?.includes("application/json");
      if (!res.ok) {
        const text = isJson ? JSON.stringify(await res.json()) : await res.text();
        throw new Error(
          `درخواست ناموفق (${res.status}): ${text || "Unknown error"}`
        );
      }

      const data: ImportResult = isJson
        ? await res.json()
        : // اگر سرور json برنگرداند:
          ({} as ImportResult);

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err?.message || "خطای ناشناخته در آپلود");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold mb-4">آپلود CSV محصولات</h1>

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
            ستون‌های لازم: «برند»، «مدل»، «نام پوشه»، «تعداد عکس». (اختیاری:
            «توضیحات»، «تگ»)
          </p>
        </div>

        <div>
          <label className="block mb-1">categoryId (اختیاری)</label>
          <input
            type="number"
            inputMode="numeric"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            placeholder="مثلاً 12"
            className="block w-full border rounded p-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            اگر خالی بماند، برند فقط بر اساس عنوانش بررسی/ایجاد می‌شود.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="skipExisting"
            type="checkbox"
            checked={skipExisting}
            onChange={(e) => setSkipExisting(e.target.checked)}
          />
          <label htmlFor="skipExisting">رد کردن محصولات موجود (پیش‌فرض)</label>
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
            <div>کل ردیف‌ها: {result.total}</div>
            <div>درج‌شده: {result.inserted}</div>
            <div>ردشده (موجود): {result.skipped}</div>
            <div>ناموفق: {result.failed}</div>
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
