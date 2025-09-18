"use client";

import { useEffect, useMemo, useState } from "react";
import MoneyInput, { formatMoneyInput, toEnDigits } from "../shared/MonyInput";
import ReusableModal from "../shared/generalModal";


type Messages = {
  usdModal?: {
    title?: string;
    desc?: string;
    placeholder?: string;
    submit?: string;
    cancel?: string;
  };
};

export default function DollarPriceModal({
  open,
  initialValue,
  onClose,
  onSubmit,
  loading,
  messages,
}: {
  open: boolean;
  initialValue?: string | number;
  onClose: () => void;
  onSubmit: (digits: string) => void; 
  loading?: boolean;
  messages?: Messages;
}) {
  const t = useMemo(
    () => ({
      title: messages?.usdModal?.title ?? "قیمت دلار",
      desc:
        messages?.usdModal?.desc ??
        "قیمت دلار روز را وارد کنید تا قیمت همهٔ کالاهای دلاری به‌روز شود.",
      placeholder: messages?.usdModal?.placeholder ?? "قیمت دلار به تومان",
      submit: messages?.usdModal?.submit ?? "ثبت",
      cancel: messages?.usdModal?.cancel ?? "انصراف",
    }),
    [messages]
  );

  const [val, setVal] = useState<string>("");

  useEffect(() => {
    const raw = (initialValue ?? "").toString();
    setVal(formatMoneyInput(raw, false));
  }, [initialValue, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = toEnDigits(val).replaceAll(",", "").trim();
    onSubmit(digits || "0");
  };

  return (
    <ReusableModal isOpen={open} onClose={onClose} title={t.title} size="md">
      <form onSubmit={handleSubmit} dir="rtl" className="text-right">
        <p className="text-sm text-gray-600 leading-6 mb-5">{t.desc}</p>

        <MoneyInput
          value={val}
          onChange={setVal}
          placeholder={t.placeholder}
          allowDecimal={false}
          className="w-full text-base"
          dir="rtl"
          name="usd"
        />

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border px-4 py-2.5"
            disabled={loading}
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-teal-600 text-white px-4 py-2.5 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "در حال ارسال..." : t.submit}
          </button>
        </div>
      </form>
    </ReusableModal>
  );
}
