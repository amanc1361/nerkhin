"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { productMessages as msg } from "@/app/constants/productMessages";
import { ProductViewModel } from "@/app/types/product/product";
import Pagination from "@/app/components/shared/Pagination";

interface Props {
  products: ProductViewModel[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onEdit?: (product: ProductViewModel) => void;
  onDelete?: (id: number) => void;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const ProductTable: React.FC<Props> = ({
  products,
  currentPage,
  totalPages,
  totalCount,
  onEdit,
  onDelete,
  onPageChange,
  isLoading = false,
  error = null,
}) => {
  return (
    <div className="space-y-6 mt-6">
      {/* عنوان جدول */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {msg.productListTitle} ({totalCount})
        </h2>
      </div>

      {/* خطا / لودینگ */}
      {isLoading && <p className="text-sm text-gray-400">{msg.loading}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!isLoading && !error && products.length === 0 && (
        <p className="text-sm text-gray-500">{msg.noProducts}</p>
      )}

      {/* جدول */}
      {!isLoading && products.length > 0 && (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm text-right text-gray-800 dark:text-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">{msg.tableHeaderTitle}</th>
                <th className="px-4 py-3">{msg.tableHeaderDescription}</th>
                <th className="px-4 py-3 text-center">{msg.tableHeaderDate}</th>
                <th className="px-4 py-3 text-center">{msg.tableHeaderActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((p, idx) => (
                <tr
                  key={p.id}
                  className={`transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/70"
                  }`}
                >
                  <td className="px-4 py-3 whitespace-pre-wrap font-medium align-middle">
                    {`${p.subCategoryTitle} ${p.brandTitle} ${p.modelName ?? ""}`}
                  </td>
                  <td className="px-4 py-3 align-middle">{p.description}</td>
                  <td className="px-4 py-3 text-center align-middle">
                    {new Date(p.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="px-4 py-3 text-center align-middle">
                    <div className="flex justify-center items-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(p)}
                          title={msg.editProduct}
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (confirm(msg.confirmDelete)) onDelete(p.id);
                          }}
                          title={msg.deleteProduct}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* صفحه‌بندی */}
      {onPageChange && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
};
