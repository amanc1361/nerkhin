// components/utils/PersianDate.tsx
"use client";

import React, { useEffect, useState } from "react";
import moment from "moment-jalaali";
import { AllowedDateInput, normalizeDbDate } from "../types/date/dbdate";


type Props = {
  /** هر نوع تاریخ مجاز: ISO string | number | Date | DbDate | null/undefined */
  value?: AllowedDateInput;
  className?: string;
};

const PersianDate: React.FC<Props> = ({ value, className }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  

  useEffect(() => {
    // فعال‌سازی فارسی
    moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });

    const raw = normalizeDbDate(value);     // ← اینجا همه‌چیز نرمال می‌شود
    const m = raw !== undefined ? moment(raw) : moment();  // اگر خالی بود، امروز

    const today = moment().format("jYYYY/jMM/jDD");
    const target = m.format("jYYYY/jMM/jDD");

    let dateStr: string;
    if (raw === undefined) {
      // اگر ورودی خالی/نامعتبر بود → امروز با فرمت کامل
      dateStr = m.format("jD jMMMM jYYYY");
    } else if (today === target) {
      // اگر تاریخِ امروز باشد → فقط ساعت
      dateStr = m.format("HH:mm");
    } else {
      // سایر تاریخ‌ها → روز + ماه شمسی
      dateStr = m.format("jD jMMMM");
    }

    setFormattedDate(dateStr);
  }, [value]);

  if (formattedDate === null) return null;

  return (
    <div
      dir="rtl"
      lang="fa"
      className={`text-right text-gray-medium dark:text-gray-400 text-sm VazirFontMedium ${className || ""}`}
    >
      {formattedDate}
    </div>
  );
};

export default PersianDate;
