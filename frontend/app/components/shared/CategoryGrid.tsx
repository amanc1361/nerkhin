import type { Category } from "@/app/types/category/categoryManagement";
import CategoryCard from "./CategoryCard";

export type CategoryGridProps = {
  categories: Category[];
  linkFor: (c: Category) => string;
};

export default function CategoryGrid({ categories, linkFor }: CategoryGridProps) {
  return (
    <div
      dir="rtl"
      className="mx-auto max-w-6xl px-4 my-5 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5"
    >
      {categories.map((c) => (
        <CategoryCard key={c.id} item={c} href={linkFor(c)} />
      ))}
    </div>
  );
}
