import { Category } from "@/app/types/category/categoryManagement";
import CategoryCard from "./CategoryCard";

export default function CategoryGrid({
  categories,
  role,
}: {
  categories: Category[];
  role: "wholesaler" | "retailer";
}) {
  if (!categories?.length) {
    return <div className="text-center text-gray-400 py-8">—</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6 my-6">
      {categories.map((c) => (
        <CategoryCard
          key={c.id}
          item={c}
          href={`/${role}/brands?categoryId=${c.id}`}
        />
      ))}
    </div>
  );
}
