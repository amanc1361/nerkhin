"use client";

import { useState } from "react";
import { useRegisteredProducts } from "@/app/hooks/useRegisteredProducts";
import { useCategories } from "@/app/hooks/useCategories";
import { productMessages as msg } from "@/app/constants/productMessages";
import { ProductTable } from "../../shared/ProductTable";


const RegisteredProductsTab = () => {
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { products,pageNumber,pageSize,total, loading, error } = useRegisteredProducts({
    categoryId,
    search,
    page,
    
  });

  const { categories } = useCategories();

  return (
    <div className="space-y-6">
      {/* فیلتر دسته و جستجو */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* فیلتر دسته */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label
            htmlFor="categoryFilter"
            className="text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            {msg.selectCategory}
          </label>
          <select
            id="categoryFilter"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full sm:w-52 bg-white text-gray-800"
            value={categoryId ?? ""}
            onChange={(e) =>
              setCategoryId(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">{msg.allCategories}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>

        {/* فیلتر جستجو */}
        <div className="flex items-center gap-3 w-full sm:w-80">
          <label
            htmlFor="productSearch"
            className="text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            {msg.searchPlaceholder}
          </label>
          <input
            id="productSearch"
            type="text"
            className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full placeholder-gray-400"
            placeholder={msg.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* جدول نمایش محصولات */}
      <ProductTable
        products={products}
        currentPage={pageNumber}
        totalPages={Math.ceil((total || 0) / (pageSize|| 1))}
        totalCount={total || 0}
        isLoading={loading}
        error={error}
        
        onPageChange={(page:any) => setPage(page)}
       
      />
    </div>
  );
};
    
export default RegisteredProductsTab;
