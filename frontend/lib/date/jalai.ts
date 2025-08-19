// lib/date/jalali.ts
// تبدیل گرگوری ⇄ جلالی + قالب‌بندی کامل برای نمایش تاریخ امروز به فارسی
// مستقل از ICU و بدون نیاز به پکیج؛ از تایم‌زون Asia/Tehran استفاده می‌کند.

const persianMonths = [
  "فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور",
  "مهر","آبان","آذر","دی","بهمن","اسفند",
];

const persianWeekdays = [
  "یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه",
];

// تبدیل ارقام انگلیسی به فارسی
export function toPersianDigits(input: string | number): string {
  const map: Record<string, string> = {
    "0": "۰","1": "۱","2": "۲","3": "۳","4": "۴",
    "5": "۵","6": "۶","7": "۷","8": "۸","9": "۹",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

// --- الگوریتم جلالی (from well-known jalaali conversion) ---
function div(a: number, b: number) { return ~~(a / b); }

function g2d(gy: number, gm: number, gd: number) {
  const g_d_m = [0,31,59,90,120,151,181,212,243,273,304,334];
  gy -= 1600; gm -= 1; gd -= 1;
  let day = 365 * gy + div(gy + 3, 4) - div(gy + 99, 100) + div(gy + 399, 400);
  for (let i = 0; i < gm; i++) day += g_d_m[i];
  const isLeap = ((gy + 1600) % 4 === 0 && (((gy + 1600) % 100 !== 0) || ((gy + 1600) % 400 === 0)));
  if (gm > 1 && isLeap) day += 1;
  return day + gd - 79;
}

function d2j(gDayNo: number) {
  const j_np = div(gDayNo, 12053);
  gDayNo %= 12053;

  let jy = 979 + 33 * j_np + 4 * div(gDayNo, 1461);
  gDayNo %= 1461;

  if (gDayNo >= 366) {
    jy += div(gDayNo - 1, 365);
    gDayNo = (gDayNo - 1) % 365;
  }

  let jm: number, jd: number;
  if (gDayNo < 186) {
    jm = 1 + div(gDayNo, 31);
    jd = 1 + (gDayNo % 31);
  } else {
    jm = 7 + div(gDayNo - 186, 30);
    jd = 1 + ((gDayNo - 186) % 30);
  }
  return { jy, jm, jd };
}

export function toJalali(gy: number, gm: number, gd: number) {
  return d2j(g2d(gy, gm, gd));
}

// تاریخ امروز به وقت ایران (گرگوری)
function nowInTehranParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value!;
  const gy = Number(get("year"));
  const gm = Number(get("month"));
  const gd = Number(get("day"));
  const wdEn = get("weekday"); // Sun..Sat
  const weekdayIndex = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(wdEn);
  return { gy, gm, gd, weekdayIndex };
}

// رشته کامل: «سه‌شنبه ۲۳ مهر ۱۴۰۳»
export function formatTodayJalali(): string {
  const { gy, gm, gd, weekdayIndex } = nowInTehranParts();
  const { jy, jm, jd } = toJalali(gy, gm, gd);
  const weekdayFa = persianWeekdays[weekdayIndex];
  const monthFa = persianMonths[jm - 1];
  return `${weekdayFa} ${toPersianDigits(jd)} ${monthFa} ${toPersianDigits(jy)}`;
}
