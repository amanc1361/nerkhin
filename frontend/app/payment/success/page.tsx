import { authOptions } from "@/lib/server/authOptions";
import { getServerSession } from "next-auth";

import { redirect } from "next/navigation";
import SubscriptionSuccessClient from "./SubscriptionSuccessClient";


// این کامپوننت در سمت سرور اجرا می‌شود
export default async function SubscriptionSuccessPage() {
  // اطلاعات کاربر را با استفاده از getServerSession دریافت می‌کنیم
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  // اگر نقش کاربر وجود نداشت، او را هدایت می‌کنیم
  if (!userRole) {
    redirect("/login"); // یا هر مسیر مناسب دیگر
  }

  // کامپوننت کلاینت را با پاس دادن نقش کاربر رندر می‌کنیم
  return <SubscriptionSuccessClient role={userRole} />;
}

