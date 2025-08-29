"use client";

import React from "react";

/** تبدیل ارقام فارسی/عربی به انگلیسی */
const faToEnMap: Record<string, string> = {
  "۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9",
  "٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9"
};
export function toEnDigits(s: string) {
  return s.replace(/[0-9٠-٩۰-۹]/g, (d) => faToEnMap[d] ?? d);
}

/** تبدیل رشتهٔ فرمت‌شده به عدد */
export function parseMoney(input: string): number {
  const clean = toEnDigits(input).replaceAll(",", "").replace(/٫/g, ".");
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

/** فرمت‌کردن حین تایپ (سه‌رقم سه‌رقم + یک اعشار اختیاری) */
export function formatMoneyInput(input: string, allowDecimal = true) {
  let s = toEnDigits(input)
    .replace(/[^0-9.٫]/g, "")
    .replace(/٫/g, ".");
  if (!allowDecimal) s = s.replace(/\./g, ""); // ممنوعیت اعشار

  // فقط یک نقطه
  s = s.replace(/(\..*)\./g, "$1");

  const endsWithDot = s.endsWith(".");
  const [intRaw, decRaw = ""] = s.split(".");
  const intPart = intRaw.replace(/^0+(?=\d)/, "");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (allowDecimal) {
    if (endsWithDot) return grouped + ".";
    return decRaw ? `${grouped}.${decRaw}` : grouped;
  }
  return grouped;
}

type MoneyInputProps = {
  value: string;                                // مقدار فرمت‌شده (کنترل‌شده از والد)
  onChange: (formatted: string) => void;        // خروجی فرمت‌شده
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dir?: "rtl" | "ltr";
  allowDecimal?: boolean;                       // پیش‌فرض: true
  name?: string;
};

export default function MoneyInput({
  value,
  onChange,
  placeholder,
  disabled,
  className = "",
  dir = "rtl",
  allowDecimal = true,
  name,
}: MoneyInputProps) {
  return (
    <input
      name={name}
      inputMode="decimal"
      dir={dir}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(formatMoneyInput(e.target.value, allowDecimal))}
      className={`rounded-2xl border border-slate-200 p-3 outline-none bg-white ${className}`}
    />
  );
}
