import { fetchMyCustomers } from "@/lib/server/favoriteAccountActions";
import { getFavoriteMessages } from "@/lib/server/texts/favoriteMessages";
import MyCustomersList from "@/app/components/favorite/MyCustomersList";

export const dynamic = "force-dynamic";

export default async function Page() {
  const t = getFavoriteMessages("fa");
  const items = await fetchMyCustomers();
  return (
    <main dir="rtl" className="max-w-2xl mx-auto p-4">
      <h1 className="text-lg font-bold mb-3">{t.title}</h1>
      <MyCustomersList t={t} items={items} shopBase="/shop" />
    </main>
  );
}
