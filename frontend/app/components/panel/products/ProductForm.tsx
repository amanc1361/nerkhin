"use client";

import React, { useState } from "react";
import { Brand, Filter, Model } from "@/app/types/types";
import { productMessages } from "@/app/constants/productMessages";
import { ProductFilterData } from "@/app/types/model/model";
import { productApi } from "@/app/services/brandapi";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { SuccessResponse } from "@/app/types/types";
import { ApiError } from "@/app/services/apiService";

interface ProductFormProps {
  brand: Brand;
  model: Model;
  filters: Filter[];
  onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  brand,
  model,
  filters,
  onSuccess,
}) => {
  const { api } = useAuthenticatedApi();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [filterOptions, setFilterOptions] = useState<Record<number, string[]>>(
    () =>
      filters.reduce((acc, filter) => {
        acc[filter.id] = [];
        return acc;
      }, {} as Record<number, string[]>)
  );

  const [newOption, setNewOption] = useState<Record<number, string>>({});

  const handleAddOption = (filterId: number) => {
    const value = newOption[filterId]?.trim();
    if (value && !filterOptions[filterId].includes(value)) {
      setFilterOptions((prev) => ({
        ...prev,
        [filterId]: [...prev[filterId], value],
      }));
      setNewOption((prev) => ({ ...prev, [filterId]: "" }));
    }
  };

  const handleRemoveOption = (filterId: number, option: string) => {
    setFilterOptions((prev) => ({
      ...prev,
      [filterId]: prev[filterId].filter((opt) => opt !== option),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", String(price));
    formData.append("brandId", String(brand.id));
    formData.append("modelId", String(model.id));

    const filterData = Object.entries(filterOptions).map(([filterId, options]) => ({
      filterId: Number(filterId),
      options,
    }));

    formData.append("filters", JSON.stringify(filterData));

    try {
      await api.post<SuccessResponse>(productApi.create(formData));
      onSuccess();
      setName("");
      setPrice("");
      setFilterOptions(
        filters.reduce((acc, f) => {
          acc[f.id] = [];
          return acc;
        }, {} as Record<number, string[]>)
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : productMessages.error;
      alert(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-1 font-medium">{productMessages.productNameLabel}</label>
        <input
          className="w-full border p-2 rounded-md"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">{productMessages.productPriceLabel}</label>
        <input
          type="number"
          className="w-full border p-2 rounded-md"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">{productMessages.filterOptionsTitle}</h3>

        {filters.map((filter) => (
          <div key={filter.id} className="border p-3 rounded-md">
            <label className="font-medium block mb-2">{filter.name}</label>

            <div className="flex flex-wrap gap-2 mb-2">
              {filterOptions[filter.id]?.map((opt) => (
                <span
                  key={opt}
                  className="bg-gray-200 dark:bg-gray-700 text-sm px-2 py-1 rounded flex items-center gap-1"
                >
                  {opt}
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(filter.id, opt)}
                    className="text-red-600 hover:text-red-800"
                    title="حذف"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border p-2 rounded-md"
                value={newOption[filter.id] || ""}
                onChange={(e) =>
                  setNewOption((prev) => ({ ...prev, [filter.id]: e.target.value }))
                }
                placeholder="گزینه جدید را وارد کنید"
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={() => handleAddOption(filter.id)}
              >
                {productMessages.addOption}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          {productMessages.submitProduct}
        </button>
      </div>
    </form>
  );
};
