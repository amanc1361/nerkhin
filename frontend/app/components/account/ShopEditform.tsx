// app/[role]/account/edit/shop-edit-form.tsx
"use client";

import { AccountUser } from "@/app/types/account/account";
import { updateShopAction, UpdateShopResult } from "@/lib/server/shopaction";
import { ShopEditMessages } from "@/lib/server/texts/shopEditMessages";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import MapPicker from "../map/MapPicker";


function SubmitBtn({ t }: { t: ShopEditMessages }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-white hover:bg-indigo-700 disabled:opacity-60"
      disabled={pending}
    >
      {pending ? t.actions.saving : t.actions.save}
    </button>
  );
}

type Props = {
  locale?: "fa" | "en";
  t: ShopEditMessages;
  user: AccountUser;
};
const initialState: UpdateShopResult = { ok: true };

export default function ShopEditForm({ t, user }: Props) {
  const [state, formAction] = useFormState<UpdateShopResult, FormData>(
    updateShopAction,
    initialState
  );

  // image preview
  const [imagePreview, setImagePreview] = useState<string | null>(
    user.imageUrl || null
  );
  const fileRef = useRef<HTMLInputElement>(null);

  // socials (چهارتا فیلد ثابتِ بک‌اند)
  const [telegram, setTelegram] = useState(user.telegramUrl || "");
  const [instagram, setInstagram] = useState(user.instagramUrl || "");
  const [website, setWebsite] = useState(user.websiteUrl || "");
  const [whatsapp, setWhatsapp] = useState(user.whatsappUrl || "");

  // geo
  const [lat, setLat] = useState<string>(user.latitude?.Decimal || "");
  const [lng, setLng] = useState<string>(user.longitude?.Decimal || "");

  useEffect(() => {
    if (state?.ok) {
      // ساده: بعد از ذخیره موفق می‌تونیم پیام بدهیم یا رفرش کنیم
    //  alert(t.actions.saved);
    } else if (state && !state.ok) {
      alert(state.error || t.errors.unknown);
    }
  }, [state, t]);

  const onPickGeo = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
      },
      () => {}
    );
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImagePreview(url);
  };

  return (
    <form action={formAction} className="space-y-4">
      {/* avatar */}
      <input type="hidden" name="role" value="wholesaler" />


      <div className="flex flex-col items-center gap-2">
        <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-indigo-200">
          <Image
            src={imagePreview || "/images/avatar-placeholder.png"}
            alt="avatar"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <button
          type="button"
          className="text-sm text-indigo-700"
          onClick={() => fileRef.current?.click()}
        >
          {t.changeImage} ✏️
        </button>
        <input
          ref={fileRef}
          type="file"
          name="image"
          accept="image/*"
          className="hidden"
          onChange={onImageChange}
        />
      </div>

      {/* shopName */}
      <div className="space-y-1">
        <label className="text-sm text-gray-600">{t.fields.shopName}</label>
        <input
          name="shopName"
          defaultValue={user.shopName || ""}
          placeholder={t.fields.shopName}
          className="w-full rounded-xl border px-3 py-2 text-sm"
        />
      </div>

      {/* phones */}
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">{t.fields.phone1}</label>
          <input
            name="shopPhone1"
            defaultValue={user.shopPhone1 || ""}
            placeholder={t.fields.phone1}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">{t.fields.phone2}</label>
          <input
            name="shopPhone2"
            defaultValue={user.shopPhone2 || ""}
            placeholder={t.fields.phone2}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">{t.fields.phone3}</label>
          <input
            name="shopPhone3"
            defaultValue={user.shopPhone3 || ""}
            placeholder={t.fields.phone3}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* address */}
      <div className="space-y-1">
        <label className="text-sm text-gray-600">{t.fields.address}</label>
        <input
          name="shopAddress"
          defaultValue={user.shopAddress || ""}
          placeholder={t.fields.address}
          className="w-full rounded-xl border px-3 py-2 text-sm"
        />
      </div>

      {/* description (UI-only) */}
      <div className="space-y-1">
        <label className="text-sm text-gray-600">{t.fields.description}</label>
        <textarea
          placeholder={t.fields.description}
          className="min-h-24 w-full rounded-xl border px-3 py-2 text-sm"
        />
      </div>

      {/* map / geo */}
        <div className="space-y-2">
  <div className="flex items-center justify-between">
    <label className="text-sm text-gray-600">{t.fields.map}</label>
    {/* GeolocateControl خودِ Map هست؛ این دکمه فقط کمکی است */}
    <button
      type="button"
      className="text-xs text-indigo-700"
      onClick={() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLat(String(pos.coords.latitude));
            setLng(String(pos.coords.longitude));
          },
          () => {}
        );
      }}
    >
      انتخاب موقعیت فعلی
    </button>
  </div>

  <MapPicker
    lat={lat}
    lng={lng}
    onChange={(la, lo) => {
      setLat(la);
      setLng(lo);
    }}
    height={200}
  />

  {/* این ورودی‌ها ارسال می‌شوند و با نقشه sync هستند */}
  <div className="mt-2 grid grid-cols-2 gap-3">
    <input
      name="latitude"
      value={lat}
      onChange={(e) => setLat(e.target.value)}
      placeholder="عرض جغرافیایی"
      className="w-full rounded-xl border px-3 py-2 text-sm"
    />
    <input
      name="longitude"
      value={lng}
      onChange={(e) => setLng(e.target.value)}
      placeholder="طول جغرافیایی"
      className="w-full rounded-xl border px-3 py-2 text-sm"
    />
  </div>
</div>

      {/* socials */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">{t.socials.title}</label>
          {/* دکمه افزودن نمادین؛ فیلدهای ثابت‌اند */}
          <span className="text-xs text-gray-400">{t.socials.add} ➕</span>
        </div>

        {/* Telegram */}
        <div className="rounded-xl border p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm">{t.socials.telegram}</span>
            <div className="flex items-center gap-3 text-xs">
              <button type="button" onClick={() => setTelegram("")} className="text-rose-600">
                {t.socials.remove}
              </button>
            </div>
          </div>
          <input
            name="telegramUrl"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            placeholder={t.socials.placeholder}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        {/* Instagram */}
        <div className="rounded-xl border p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm">{t.socials.instagram}</span>
            <button type="button" onClick={() => setInstagram("")} className="text-xs text-rose-600">
              {t.socials.remove}
            </button>
          </div>
          <input
            name="instagramUrl"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder={t.socials.placeholder}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        {/* Website */}
        <div className="rounded-xl border p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm">{t.socials.website}</span>
            <button type="button" onClick={() => setWebsite("")} className="text-xs text-rose-600">
              {t.socials.remove}
            </button>
          </div>
          <input
            name="websiteUrl"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder={t.socials.placeholder}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        {/* WhatsApp */}
        <div className="rounded-xl border p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm">{t.socials.whatsapp}</span>
            <button type="button" onClick={() => setWhatsapp("")} className="text-xs text-rose-600">
              {t.socials.remove}
            </button>
          </div>
          <input
            name="whatsappUrl"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder={t.socials.placeholder}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <SubmitBtn t={t} />
    </form>
  );
}
