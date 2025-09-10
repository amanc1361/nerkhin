// lib/types/dbDate.ts
export interface DbDate {
    Time: string;   // ISO string, e.g. "2025-09-08T19:56:09.10629Z"
    Valid: boolean; // DB nullability flag
  }
  
  /** کمک: اول مطمئن می‌شویم شئ ساده‌ی قابل ایندکس است */
  export function isRecord(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === "object" && obj !== null;
  }
  
  /** آیا ورودی دقیقا فرمت DbDate دارد؟ */
  export function isDbDate(obj: unknown): obj is DbDate {
    if (!isRecord(obj)) return false;
    return (
      typeof obj.Time === "string" &&
      typeof obj.Valid === "boolean"
    );
  }
  
  /** تاریخ ورودی را نرمال می‌کند و خروجی استاندارد می‌دهد */
  export type AllowedDateInput = string | number | Date | DbDate | null | undefined;
  
  /**
   * اگر DbDate بود و Valid=true ⇒ رشته‌ی ISO را برمی‌گرداند.
   * اگر DbDate بود و Valid=false ⇒ undefined.
   * اگر string/number/Date بود ⇒ همان را برمی‌گرداند.
   * غیر از این‌ها ⇒ undefined
   */
  export function normalizeDbDate(value: AllowedDateInput): string | number | Date | undefined {
    if (value == null) return undefined;
  
    // اگر DbDate باشد
    if (isDbDate(value)) {
      return value.Valid ? value.Time : undefined;
    }
  
    // اگر تاریخ استاندارد باشد
    if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
      return value;
    }
  
    // سایر انواع پشتیبانی نمی‌شوند
    return undefined;
  }
  