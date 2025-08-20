import { Category } from "@/app/types/category/categoryManagement";
import CategoryCard from "./CategoryCard";

export default function CategoryGrid({ categories, role }: { categories: Category[]; role: "wholesaler" | "retailer" }) {
  return (
    <div dir="rtl" className="mx-auto max-w-6xl px-4 my-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
      {categories.map(c => (
        <CategoryCard key={c.id} item={c} href={`/${role}/brands?categoryId=${c.id}`} />
      ))}
    </div>
  );
}
