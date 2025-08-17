// فایل: app/components/panel/brands/ProductFormBody.tsx
"use client";

import React from "react";
import Image from "next/image";
import LoadingSpinner from "@/app/components/Loading/Loading";
import { ImageUploader } from "@/app/components/shared/ImageUploader";
import { TagInput } from "@/app/components/shared/TagInput";

import { ProductFilterData } from "@/app/types/model/model";
import { productMessages as msg } from "@/app/constants/productMessages";
import {
  ProductFormState,
  ProductTag,
} from "@/app/types/product/productFormState";

interface Props {
  formData: ProductFormState;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormState>>;
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  defaultImageIndex: number;
  setDefaultImageIndex: React.Dispatch<React.SetStateAction<number>>;
  filters: ProductFilterData[];
  isLoadingFilters: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  mode: "create" | "edit";
}

export const ProductFormBody: React.FC<Props> = ({
  formData,
  setFormData,
  images,
  setImages,
  defaultImageIndex,
  setDefaultImageIndex,
  filters,
  isLoadingFilters,
  isSubmitting,
  onSubmit,
  mode,
}) => {
  const removeOption = (fid: number, oid: number) =>
    setFormData((prev) => {
      const rest = (prev.selectedOptions[fid] ?? []).filter((id) => id !== oid);
      const newSelected =
        rest.length === 0
          ? (() => {
              const { [fid]: _, ...others } = prev.selectedOptions;
              return others;
            })()
          : { ...prev.selectedOptions, [fid]: rest };
      return { ...prev, selectedOptions: newSelected };
    });

  const addSelectedOption = () =>
    setFormData((prev) => {
      if (!prev.__newFilter || prev.__newOption === undefined) return prev;
      const fid = prev.__newFilter;
      const oid = prev.__newOption;
      const prevArr = prev.selectedOptions[fid] ?? [];
      if (prevArr.includes(oid))
        return { ...prev, __newFilter: undefined, __newOption: undefined };

      return {
        ...prev,
        selectedOptions: { ...prev.selectedOptions, [fid]: [...prevArr, oid] },
        __newFilter: undefined,
        __newOption: undefined,
      };
    });

  const remainingFilters = filters.filter((f) => {
    const fid = Number(f.filter.id);
    const chosen = formData.selectedOptions[fid] ?? [];
    return chosen.length < f.options.length;
  });

  const currentFilter = filters.find(
    (f) => Number(f.filter.id) === formData.__newFilter
  );

  const remainingOptionsOfCurrent = currentFilter
    ? currentFilter.options.filter(
        (o) =>
          !(
            formData.selectedOptions[Number(currentFilter.filter.id)] ?? []
          ).includes(Number(o.id))
      )
    : [];

  const { remoteImages } = formData;
  const totalRemote = remoteImages.length;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-10 text-sm sm:text-base"
    >
      {/* modelName */}
      <section className="space-y-2">
        <label className="block font-medium">{msg.modelNameLabel}</label>
        <input
          type="text"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2"
          value={formData.modelName}
          onChange={(e) =>
            setFormData((p) => ({ ...p, modelName: e.target.value }))
          }
          required
        />
      </section>

      {/* توضیح */}
      <section className="space-y-2">
        <label className="block font-medium">{msg.descriptionLabel}</label>
        <textarea
          className="w-full border rounded-lg p-3 dark:bg-gray-800"
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData((p) => ({ ...p, description: e.target.value }))
          }
          required
        />
      </section>

      {/* تگ‌ها */}
      <section className="space-y-2">
        <label className="block font-medium">{msg.tagsLabel}</label>
        <TagInput
          tags={formData.tags.map((t) => t.tag)}
          placeholder={msg.tagsPlaceholder}
          onTagsChange={(newTexts) =>
            setFormData((prev) => {
              const updated: ProductTag[] = newTexts.map((txt) => {
                const old = prev.tags.find((o) => o.tag === txt);
                return old ?? { id: 0, productId: 0, tag: txt };
              });
              return { ...prev, tags: updated };
            })
          }
        />
      </section>

      {/* آپلود تصویر */}
      <section className="space-y-2">
        <label className="block font-medium">{msg.imageUploadLabel}</label>

        {mode === "edit" && (
          <p className="text-xs sm:text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            توجه: در حالت ویرایش، باید <b>کل تصاویر جدید</b> را آپلود کنید. تصاویر زیر فقط
            پیش‌نمایش تصاویر فعلی هستند؛ انتخاب پیش‌فرض باید از بین عکس‌های جدید انجام شود.
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          {remoteImages.map((img, idx) => (
            <div key={img.id} className="relative">
              <Image
                src={img.url}
                alt="product"
                width={96}
                height={96}
                className="rounded object-cover"
              />

              {/* دکمه پیش‌فرض برای ریموت‌ها در ویرایش غیرفعال است */}
              <button
                type="button"
                onClick={() => {
                  if (mode === "edit") return; // بلاک
                  setDefaultImageIndex(idx);
                }}
                disabled={mode === "edit"}
                className={`absolute bottom-1 right-1 text-xs px-1 rounded ${
                  idx === defaultImageIndex && mode !== "edit"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                } ${mode === "edit" ? "opacity-60 cursor-not-allowed" : ""}`}
                title={
                  mode === "edit"
                    ? "انتخاب پیش‌فرض فقط از بین عکس‌های جدید مجاز است"
                    : "پیش‌فرض"
                }
              >
                پیش‌فرض
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData((p) => ({
                    ...p,
                    remoteImages: p.remoteImages.filter((r) => r.id !== img.id),
                  }));
                  if (defaultImageIndex === idx) {
                    // اگر پیش‌فرض روی همین ریموت بود، به 0 (اولین جدید) برگردان
                    setDefaultImageIndex(0);
                  }
                }}
                className="absolute -top-1 -left-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                title="حذف از پیش‌نمایش"
              >
                ×
              </button>
            </div>
          ))}

          <ImageUploader
            images={images}
            setImages={setImages}
            defaultIndex={
              defaultImageIndex >= totalRemote
                ? defaultImageIndex - totalRemote
                : -1
            }
            setDefaultIndex={(idx) => setDefaultImageIndex(idx + totalRemote)}
          />
        </div>
      </section>

      {/* فیلترها */}
      <section className="space-y-4">
        <h3 className="font-medium">{msg.filtersSectionTitle}</h3>

        {isLoadingFilters ? (
          <LoadingSpinner size="small" mode="inline" />
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg flex flex-col sm:flex-row sm:items-end gap-3">
            <select
              className="flex-1 border rounded-lg p-2 dark:bg-gray-800"
              value={formData.__newFilter ?? ""}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  __newFilter: Number(e.target.value) || undefined,
                  __newOption: undefined,
                }))
              }
              disabled={filters.length === 0}
            >
              <option value="">{msg.selectFilter}</option>
              {filters.map((f) => (
                <option key={f.filter.id} value={f.filter.id}>
                  {f.filter.name}
                </option>
              ))}
            </select>

            <select
              className="flex-1 border rounded-lg p-2 dark:bg-gray-800"
              value={formData.__newOption ?? ""}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  __newOption: Number(e.target.value) || undefined,
                }))
              }
              disabled={!currentFilter || remainingOptionsOfCurrent.length === 0}
            >
              <option value="">{msg.selectOptionPlaceholder}</option>
              {remainingOptionsOfCurrent.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="shrink-0 bg-orange-500 text-white px-4 py-2 rounded-lg"
              disabled={
                !formData.__newFilter ||
                formData.__newOption === undefined ||
                remainingOptionsOfCurrent.length === 0
              }
              onClick={addSelectedOption}
            >
              {msg.addFilter}
            </button>
          </div>
        )}
      </section>

      {Object.keys(formData.selectedOptions).length > 0 && (
        <section className="space-y-3">
          {Object.entries(formData.selectedOptions).map(([fidStr, optIds]) => {
            const fid = Number(fidStr);
            const filter = filters.find((f) => Number(f.filter.id) === fid);
            if (!filter) return null;

            return (
              <div key={fid} className="space-y-2 border rounded-lg p-4">
                <h4 className="font-medium text-sm sm:text-base">
                  {filter.filter.name}
                </h4>

                <div className="flex flex-wrap gap-2">
                  {(optIds as number[]).map((oid) => {
                    const opt = filter.options.find((o) => o.id === oid);
                    if (!opt) return null;
                    return (
                      <span
                        key={oid}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                      >
                        {opt.name}
                        <button
                          type="button"
                          onClick={() => removeOption(fid, oid)}
                          className="leading-none"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg"
        >
          {isSubmitting
            ? msg.submitting
            : mode === "edit"
            ? msg.updateButton
            : msg.submitButton}
        </button>
      </section>
    </form>
  );
}
