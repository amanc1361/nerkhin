"use client";

import { useEffect, useRef, useState } from "react";
import { useReportActions } from "@/app/hooks/useReportActions";
import { toast } from "react-toastify";

type Messages = {
  title?: string;
  subtitle?: string;
  fields?: { subject?: string; description?: string };
  actions?: { submit?: string; cancel?: string };
  toasts?: { success?: string; validation?: string };
};

export default function ReportModal({
  open,
  onClose,
  targetUserId,
  t,
}: {
  open: boolean;
  onClose: () => void;
  targetUserId: number;
  t?: Messages;
}) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const { createReport, isSubmitting } = useReportActions(() => {
    // after success callback (optional)
  });

  useEffect(() => {
    if (open) {
      // قفل اسکرول بک‌گراند
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSubject("");
      setDescription("");
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (!targetUserId || !subject.trim() || !description.trim()) {
      toast.warn(t?.toasts?.validation ?? "عنوان و توضیحات الزامی است.");
      return;
    }
    const ok = await createReport({
      targetUserId,
      title: subject.trim(),
      description: description.trim(),
    });
    if (ok) {
      toast.success(t?.toasts?.success ?? "گزارش با موفقیت ثبت شد.");
      onClose();
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal
      role="dialog"
      aria-labelledby="report-title"
      aria-describedby="report-desc"
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="بستن"
        title="بستن"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative w-[92%] max-w-md rounded-2xl bg-white p-4 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-0.5">
            <h2 id="report-title" className="text-base font-bold">
              {t?.title ?? "گزارش تخلف"}
            </h2>
            <p id="report-desc" className="text-xs text-gray-500">
              {t?.subtitle ?? "لطفاً جزییات را با دقت وارد کنید."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100"
            aria-label="بستن"
            title="بستن"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t?.fields?.subject ?? "عنوان"}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثلاً: تبلیغات گمراه‌کننده"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t?.fields?.description ?? "توضیحات"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-28 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="جزییات تخلف را بنویسید…"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-blue-600 text-white py-2 text-sm disabled:opacity-60"
          >
            {t?.actions?.submit ?? "ثبت گزارش"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border py-2 text-sm"
          >
            {t?.actions?.cancel ?? "انصراف"}
          </button>
        </div>
      </div>
    </div>
  );
}
