// toPersianDate.ts
export function toPersianDate(
  time?: Date | number | string | null
): string {
  if (time === undefined || time === null) return "";
  const date: Date = time instanceof Date ? time : new Date(time);
  const day   = getDateFormat(date, { day: "2-digit" });
  const month = getDateFormat(date, { month: "numeric" });
  const year  = getDateFormat(date, { year: "numeric" });
  return `${year}/${month}/${day}`;
}
function getDateFormat(
  date: Date,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat("fa-IR", options).format(date);
}
