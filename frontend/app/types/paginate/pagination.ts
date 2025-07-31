export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;   // همان نامی که از سرور می‌آید
}

// اگر خواستید به حالت camelCase تبدیل شود:
export interface PaginatedCamel<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}