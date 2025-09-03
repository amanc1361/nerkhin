"use client";

import React, { useEffect, useState } from "react";
import moment from "moment-jalaali";

type Props = {
  /** تاریخ دلخواه. اگر خالی باشه → امروز */
  value?: string | Date | number;
  className?: string;
};

const PersianDate: React.FC<Props> = ({ value, className }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });

    const m = value ? moment(value) : moment(); // اگر value نبود → امروز
    const today = moment().format("jYYYY/jMM/jDD");
    const target = m.format("jYYYY/jMM/jDD");

    let dateStr: string;

    if (!value) {
      // حالت پیش‌فرض (قبلی): روز + ماه + سال شمسی امروز
      dateStr = m.format("jD jMMMM jYYYY");
    } else if (today === target) {
      // اگر تاریخ داده شده مربوط به امروز بود → فقط ساعت
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
