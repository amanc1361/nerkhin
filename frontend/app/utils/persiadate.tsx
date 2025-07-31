// components/PersianDate.tsx
"use client";

import React, { useEffect, useState } from 'react';
import moment from 'moment-jalaali'; // moment-jalaali به صورت خودکار moment را گسترش می‌دهد

// تنظیمات اولیه برای moment-jalaali (اختیاری، مثلا برای نام ماه‌های فارسی)
// moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' });

const PersianDate: React.FC = () => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // moment() تاریخ و زمان فعلی را برمی‌گرداند
    // jYYYY/jMM/jDD یک فرمت رایج برای تاریخ شمسی با moment-jalaali است
    // می‌توانید از فرمت‌های دیگر مانند 'jDD jMMMM jYYYY' برای "۳۱ اردیبهشت ۱۴۰۳" استفاده کنید
    const dateStr = moment().format('jYYYY/jMM/jDD');
    setFormattedDate(dateStr);
  }, []);

  if (formattedDate === null) {
    return null;
  }

  return (
    <div className="text-gray-medium dark:text-gray-400 text-sm VazirFontMedium">
      {formattedDate}
    </div>
  );
};

export default PersianDate;