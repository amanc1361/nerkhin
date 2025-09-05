// app/[role]/favorites/page.tsx
import { Metadata } from "next";
import { fetchFavoriteProductsSSR } from "@/lib/server/fetchFavoriteProducts";
import FavoriteProductsClient from "@/app/components/favorite/FavoriteProductsClient";

export const metadata: Metadata = { title: "پسندهای من" };

// ✅ پارامتر را بدون تایپ صریح (یا با any) بگیر تا با constraint داخلی Next درگیر نشود
export default async function Page(props: any) {
  const { params } = props as { params: { role: string } };

  const items = await fetchFavoriteProductsSSR();
  return <FavoriteProductsClient role={params.role} initialItems={items} />;
}
