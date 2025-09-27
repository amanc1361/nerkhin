// app/payment/success/page.tsx (یا هر مسیر فعلی شما)
import { authOptions } from "@/lib/server/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SubscriptionSuccessClient from "./SubscriptionSuccessClient";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SubscriptionSuccessPage() {
  noStore();

  const session = await getServerSession(authOptions);

  // اگر کلاً لاگین نیست، بفرست لاگین
  if (!session?.user?.id) {
    redirect("/login");
  }

  // نقش می‌تواند number یا string باشد؛ از null/undefined چک کن نه Falsy
  const rawRole = (session.user as any)?.role;
  const safeRole =
    rawRole !== null && rawRole !== undefined ? String(rawRole) : "retailer";

  // حالا کلاینت، update() را می‌زند و فورس‌رفرش انجام می‌شود
  return <SubscriptionSuccessClient role={safeRole} />;
}
