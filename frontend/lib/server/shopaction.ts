// app/[role]/account/edit/actions.ts
"use server";

import { updateShop } from "./server-api";



export type UpdateShopResult = { ok: true } | { ok: false; error: string };

export async function updateShopAction(
  _prevState: UpdateShopResult | null,
  formData: FormData
): Promise<UpdateShopResult> {
  try {
    // آماده‌سازی JSON مطابق بک‌اند
    const payload = {
      shopName: (formData.get("shopName") || "").toString(),
      shopPhone1: (formData.get("shopPhone1") || "").toString(),
      shopPhone2: (formData.get("shopPhone2") || "").toString(),
      shopPhone3: (formData.get("shopPhone3") || "").toString(),
      shopAddress: (formData.get("shopAddress") || "").toString(),
      telegramUrl: (formData.get("telegramUrl") || "").toString(),
      instagramUrl: (formData.get("instagramUrl") || "").toString(),
      whatsappUrl: (formData.get("whatsappUrl") || "").toString(),
      websiteUrl: (formData.get("websiteUrl") || "").toString(),
      latitude: (formData.get("latitude") || "").toString(),   // به‌صورت string
      longitude: (formData.get("longitude") || "").toString(), // به‌صورت string
    };

    const body = new FormData();
    body.set("data", JSON.stringify(payload));

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      body.append("images", file); // کلید مورد انتظار بک‌اند: "images"
    }

    await updateShop(body); // از authenticatedFetch استفاده می‌کند
    return { ok: true };
  } catch (e: any) {
    const msg = e?.message || "خطای ناشناخته";
    return { ok: false, error: msg };
  }
}
