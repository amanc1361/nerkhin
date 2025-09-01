// components/PersianDate.tsx
"use client";

import React, { useEffect, useState } from "react";
import moment from "moment-jalaali";

const PersianDate: React.FC = () => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });

    const dateStr = moment().format("jD jMMMM jYYYY");
    setFormattedDate(dateStr);
  }, []);

  if (formattedDate === null) return null;

  return (
    <div
      dir="rtl"
      lang="fa"
      className="text-right text-gray-medium dark:text-gray-400 text-sm VazirFontMedium"
    >
      {formattedDate}
    </div>
  );
};

export default PersianDate;
