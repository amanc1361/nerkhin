import "server-only";
import { redirect } from "next/navigation";
import AddUserProductForm from "@/app/components/wholesaler/AddUserProductForm";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";


type Role = "wholesaler" | "retailer";
export const revalidate = 0;

export default async function CreateUserProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ role: Role }>;
  searchParams?: Promise<{ subCategoryId?: string }>;
}) {
  const { role } = await params;
  const sp = (await searchParams) || {};
  const scId = sp.subCategoryId ? Number(sp.subCategoryId) : 0;

  // اگر زیرشاخه انتخاب نشده بود، برو به صفحهٔ شاخه‌ها (فلو افزودن محصول)
  if (!scId) {
    redirect(`/${role}/categories?from=add`);
  }

  const t = getUserProductMessages("fa");

  return (
    <main className="bg-white">
      <div dir="rtl" className="mx-auto max-w-3xl px-4 py-5 grid gap-4">
        <h1 className="text-slate-800 text-base md:text-lg">{t.toolbar.addProduct}</h1>
        <AddUserProductForm subCategoryId={scId} />
      </div>
    </main>
  );
}
