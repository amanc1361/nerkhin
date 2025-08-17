// app/lib/buildImageUrl.ts
type BuildImageUrlArgs = {
  productId: number;
  index: number; // 1..N
};

/**
 * مسیر نهایی: /uploads/{productId}/{index}.jpg
 * اگر لازم شد در آینده قابل تنظیم کنید (env)، فعلاً طبق نیاز شما ثابت نگه داشتیم.
 */
export function buildImageUrl({ productId, index }: BuildImageUrlArgs) {
  return `/uploads/${productId}/${index}.jpg`;
}
