"use client";



import React from "react";
import { Subscription } from "@/app/types/types"; // Import Subscription type
import { getPaymentGatewayInfo } from "@/app/services/payment";
import { formatNumber } from "@/app/utils/formatNumber";

interface SubscriptionItemProps {
  id: Subscription['id'];
  numberOfDays: Subscription['planId']; // Assuming planId represents number of days
  price: Subscription['price'];
  buyAction: string;
  cityId: number; // Assuming cityId is a number, not part of Subscription type
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
  id,
  numberOfDays,
  price,
  buyAction,
  cityId,
}) => {
  const handleBuyClick = async () => {
    const windowRef = window.open("", "_blank");
    if (windowRef) {
      windowRef.focus();
      windowRef.document.body.innerHTML = "...لطفا صبر کنید";
      try {
        const gatewayResponse = await getPaymentGatewayInfo(
          Number(cityId),
          Number(id), // Ensure id is number for API call
          "https://nerrkhin.com/bazaar/payment/result"
        );
        if (gatewayResponse.redirectUrl) {
          windowRef.location.replace(gatewayResponse.redirectUrl);
        } else {
          windowRef.close();
          alert("خطا در دریافت اطلاعات درگاه پرداخت.");
        }
      } catch (e) {
        console.error("Error getting payment gateway info:", e);
        windowRef.close();
        alert("خطا در اتصال به درگاه پرداخت.");
      }
    } else {
      alert("امکان باز کردن پنجره جدید وجود ندارد. لطفا پاپ‌آپ‌ها را فعال کنید.");
    }
  };

  const getNumberOfDaysLabel = (days: number): string => {
    switch (days) {
      case 1:
        return "یک ماهه";
      case 2:
        return "سه ماهه";
      case 3:
        return "شش ماهه";
      case 4: // Assuming 4 means one year based on AddNewSubscriptionsModel
        return "یک ساله";
      default:
        return "نامشخص";
    }
  };

  return (
    <div className="w-[216px] p-4 mt-9 flex flex-col justify-center items-center">
      <div className="mb-2 w-full">
        <span className="p-4 flex justify-center border-b border-b-gray-200">
          {getNumberOfDaysLabel(Number(numberOfDays))}
        </span>
        <span className="p-4 flex  justify-center text-blue-dark">
          {formatNumber(price)} تومان
        </span>
      </div>

      <div className="mb-2 bg-dark-blue h-56 w-full">
        <button
          onClick={handleBuyClick}
          className="w-full h-56  rounded-xl font-medium text-base  bg-blue-dark  transition hover:opacity-80 text-white text-center"
        >
          {buyAction}
        </button>
      </div>
    </div>
  );
}

export default SubscriptionItem;
