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
  return isNaN(n) ? 0 : Math.floor(n);
}

/**
 * فرمت‌کردن حین تایپ
 * امضای این تابع دست‌نخورده باقی مانده، اما منطق داخلی آن برای حذف امن اعشار بازنویسی شده است.
 */
export function formatMoneyInput(input: string, allowDecimal = true): string {
  if (input === null || input === undefined || input === "") {
    return "";
  }

  // ۱. ورودی را به رشته تبدیل کرده، ارقام فارسی را انگلیسی و کاماها را حذف می‌کنیم.
  const cleanString = toEnDigits(String(input)).replaceAll(",", "");

  // ۲. رشته را به عدد تبدیل می‌کنیم.
  let numberValue = parseFloat(cleanString);

  // ۳. اگر نتیجه یک عدد معتبر نبود، فقط ارقام رشته را برمی‌گردانیم.
  if (isNaN(numberValue)) {
    const onlyDigits = cleanString.replace(/[^0-9]/g, "");
    return onlyDigits;
  }

  // ۴. قسمت اعشار را به طور کامل حذف می‌کنیم (به سمت پایین گرد می‌کنیم).
  const integerValue = Math.floor(numberValue);

  // ۵. عدد صحیح نهایی را با جداکننده‌ی هزارگان برای نمایش فرمت می‌کنیم.
  return integerValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

type MoneyInputProps = {
  value: string;
  onChange: (formatted: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dir?: "rtl" | "ltr";
  allowDecimal?: boolean;
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
}: MoneyInputProps) { // <--- خطا اینجا بود و اصلاح شد
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