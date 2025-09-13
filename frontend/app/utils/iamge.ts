// از همین الگو قبلاً استفاده می‌کردی
export function absolutizeUploads(imageUrl?: string | null) {
    if (!imageUrl) return null;
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerrkhin.com").replace(/\/+$/, "");
    const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
    const clean = imageUrl.replace(/^\/+/, "");
    return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
  }
  
  /**
   * گالری را بر اساس defaultImageUrl و imagesCount می‌سازد.
   * اگر defaultImageUrl مثل .../123/2.webp بود، مسیر پایه را نگه می‌داریم و فقط شماره را 1..N می‌کنیم.
   */
  export function buildGalleryFromDefault( parentid :number,imagesCount: number) {
    const list: string[] = [];
    if (!imagesCount || imagesCount <= 0 ) return list;

    for (let i = 1; i <= imagesCount; i++) {
      list.push("https://nerrkhin.com/uploads/"+parentid+"/"+i+".webp")
    }
    return list;
  }
  