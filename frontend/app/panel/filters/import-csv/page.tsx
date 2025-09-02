// app/components/panel/tools/CsvFilterImporter.tsx
"use client";

import { useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";

type Result = {
  createdFilters: number;
  createdOptions: number;
  createdRelations: number;
  skippedEmpty: number;
  notFoundProducts: { brand: string; model: string }[];
  warnings?: string[];
};
 function CsvFilterImporter({
  defaultCategoryId,
  defaultBrandCol = "برند",
  defaultModelCol = "مدل",
  defaultStartFilterColIndex = 2, // ستون سوم (0-based)
  endpoint = "/product-filter-import/import-csv", // مسیر reverse-proxy شما به Go
}: {
  defaultCategoryId?: number;
  defaultBrandCol?: string;
  defaultModelCol?: string;
  defaultStartFilterColIndex?: number;
  endpoint?: string;
}) {
  const { api } = useAuthenticatedApi();
  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<number>(defaultCategoryId || 0);
  const [brandCol, setBrandCol] = useState<string>(defaultBrandCol);
  const [modelCol, setModelCol] = useState<string>(defaultModelCol);
  const [startIdx, setStartIdx] = useState<number>(defaultStartFilterColIndex);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRes(null);
    if (!file) {
      setError("ابتدا فایل CSV را انتخاب کنید.");
      return;
    }
    if (!categoryId) {
      setError("categoryId الزامی است.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("categoryId", String(categoryId));
      fd.append("brandCol", brandCol);
      fd.append("modelCol", modelCol);
      fd.append("startFilterColIndex", String(startIdx));

      // توجه: از api.fetch (یا api.post) پروژه خودتان استفاده کنید
      const resp = await api.postMultipart(endpoint, fd); // اگر postForm ندارید، از fetch با headers توکن استفاده کنید
      if (!resp.ok) {
        const t = await resp.json().catch(() => ({}));
        throw new Error(t?.error || "Import failed");
      }
      const data: Result = await resp.json();
      setRes(data);
    } catch (err: any) {
      setError(err.message || "خطا در ارسال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 border rounded-xl">
      <h2 className="text-lg font-bold mb-4">ایمپورت فیلترها از CSV</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">فایل CSV</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Category ID</label>
          <input
            type="number"
            value={categoryId || ""}
            onChange={(e) => setCategoryId(Number(e.target.value || 0))}
            className="border rounded px-2 py-1 w-full text-left"
            placeholder="مثلاً 17"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block mb-1">نام ستون برند</label>
            <input
              value={brandCol}
              onChange={(e) => setBrandCol(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <label className="block mb-1">نام ستون مدل</label>
            <input
              value={modelCol}
              onChange={(e) => setModelCol(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <label className="block mb-1">شروع فیلترها (ایندکس ۰-بیس)</label>
            <input
              type="number"
              value={startIdx}
              onChange={(e) => setStartIdx(Number(e.target.value || 2))}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg border"
        >
          {loading ? "در حال بارگذاری..." : "شروع ایمپورت"}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-600">
          {error}
        </div>
      )}

      {res && (
        <div className="mt-6 p-3 rounded-lg bg-gray-50 border">
          <div>فیلترهای ساخته‌شده: <b>{res.createdFilters}</b></div>
          <div>گزینه‌های ساخته‌شده: <b>{res.createdOptions}</b></div>
          <div>روابط ساخته‌شده: <b>{res.createdRelations}</b></div>
          <div>سطرهای ردشده (خالی/ناقص): <b>{res.skippedEmpty}</b></div>

          {res.notFoundProducts?.length > 0 && (
            <div className="mt-3">
              <div className="font-bold">محصولات پیدا نشدند (برند/مدل):</div>
              <ul className="list-disc pr-5">
                {res.notFoundProducts.map((x, i) => (
                  <li key={i}>{x.brand} — {x.model}</li>
                ))}
              </ul>
            </div>
          )}
          {res.warnings?.length ? (
            <ul className="mt-3 list-disc pr-5 text-amber-700">
              {res.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}


// صفحه سروریه و فقط کامپوننت کلاینتی رو رندر می‌کنه
export default function Page() {
  return (
    <div className="p-4">
      <CsvFilterImporter
        defaultCategoryId={17}
        defaultBrandCol="برند"
        defaultModelCol="مدل"
        defaultStartFilterColIndex={2}
        endpoint="/product-filter-import/import-csv" // اگر پشت Nginx داری؛ در غیر اینصورت آدرس مطلق بده
      />
    </div>
  );
}
