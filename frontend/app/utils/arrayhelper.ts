
export function removeDuplicatesById<T extends { id: K }, K extends string | number>(
  array: T[]
): T[] {
  // بررسی می‌کنیم که آرایه ورودی null، undefined یا خالی نباشد
  if (!array || array.length === 0) {
    return [];
  }

  const uniqueItems = array.filter(
    (item: T, index: number, self: T[]) =>
      // آیتمی نگه داشته می‌شود که ایندکس فعلی آن با ایندکس اولین آیتم با همان id برابر باشد
      index === self.findIndex((t: T) => t.id === item.id)
  );

  return uniqueItems;
}

// ---- مثال استفاده در TypeScript ----
