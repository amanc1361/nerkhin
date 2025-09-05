import { Metadata } from "next";
import { fetchFavoriteProductsSSR } from "@/lib/server/fetchFavoriteProducts";
import FavoriteProductsClient from "@/app/components/favorite/FavoriteProductsClient";


export const metadata: Metadata = { title: "پسندهای من" };

export default async function Page({ params }: { params: { role: string } }) {
  const items = await fetchFavoriteProductsSSR();
  return <FavoriteProductsClient role={params.role} initialItems={items} />;
}
