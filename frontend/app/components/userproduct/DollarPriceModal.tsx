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
    dollarUpdateLabel?: string;
    roundedLabel?: string;
  };
};

export default function DollarPriceModal({
  open,
  initialValue,
  initialDollarUpdate,
  initialRounded,
  onClose,
  onSubmit,
  loading,
  messages,
}: {
  open: boolean;
  initialValue?: string | number;
  initialDollarUpdate?: boolean;
  initialRounded?: boolean;
  onClose: () => void;
  onSubmit: (digits: string, dollarUpdate?: boolean, rounded?: boolean) => void;
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
      dollarUpdateLabel:
        messages?.usdModal?.dollarUpdateLabel ??
        "قیمت دلار به صورت اتوماتیک آپدیت شود",
      roundedLabel:
        messages?.usdModal?.roundedLabel ?? "قیمت‌ها رُند شوند",
    }),
    [messages]
  );

  const [val, setVal] = useState<string>("");
  const [dollarUpdate, setDollarUpdate] = useState(false);
  const [rounded, setRounded] = useState(false);

  useEffect(() => {
    const raw = (initialValue ?? "").toString();
    setVal(formatMoneyInput(raw, false));
    setDollarUpdate(initialDollarUpdate ?? false);
    setRounded(initialRounded ?? false);
  }, [initialValue,initialDollarUpdate,initialRounded, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = toEnDigits(val).replaceAll(",", "").trim();
    onSubmit(digits || "0", dollarUpdate, rounded);
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

        {/* چک‌باکس‌ها */}
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dollarUpdate}
              onChange={(e) => setDollarUpdate(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">{t.dollarUpdateLabel}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rounded}
              onChange={(e) => setRounded(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">{t.roundedLabel}</span>
          </label>
        </div>

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
