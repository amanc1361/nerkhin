// app/components/productrequest/ProductRequestForm.tsx
"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import type {
  CreateProductRequestPayload,
  CreateProductRequestResponse,
  ProductRequestMessages,
} from "@/app/types/productRequest/product-request"

type Props = {
  messages: ProductRequestMessages;
};

export default function ProductRequestForm({ messages }: Props) {
  const { api } = useAuthenticatedApi();
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!desc.trim()) {
      toast.error("لطفاً توضیحات را وارد کنید");
      return;
    }
    setLoading(true);
    try {
      const body: CreateProductRequestPayload = { description: desc.trim() };
      const res = await api.post<CreateProductRequestResponse>({
        url: "/product-request/create",
        body,
      });
      toast.success("درخواست شما ثبت شد");
      setDesc("");
      // اگر نیاز دارید به صفحه‌ی دیگری بروید، اینجا هدایت کنید
      // router.push(...);
      console.log("[ProductRequest][Create][Response] =>", res);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "ارسال درخواست ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="max-w-md mx-auto">
      {/* کارت بالا (آیکن + عنوان + توضیح) */}
      <div className="rounded-2xl border bg-white p-5 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
          {/* آیکن پاک و ساده (بدون وابستگی) */}
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-teal-600" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 7l8 5 8-5" />
            <rect x="4" y="5" width="16" height="14" rx="2" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold mb-1">{messages.title}</h1>
        <p className="text-sm leading-7 text-gray-600">
          {messages.subtitle}
        </p>
      </div>

      {/* فرم توضیحات */}
      <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm">
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={messages.placeholder}
          rows={5}
          className="w-full rounded-2xl border border-slate-200 p-3 outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-teal-600 px-4 py-3 text-white disabled:opacity-60"
        >
          {loading ? "در حال ارسال..." : messages.submit}
        </button>
      </div>
    </div>
  );
}
