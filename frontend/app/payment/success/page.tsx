import { authOptions } from "@/lib/server/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SubscriptionSuccessClient from "./SubscriptionSuccessClient";
import { normalizeRole, UserRole } from "@/app/types/role";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SubscriptionSuccessPage() {
  noStore();

  const session = await getServerSession(authOptions);

  // اگر لاگین نیستی، هر کاری صلاحته
  // if (!session?.user?.id) redirect("/login");

  const rawRole = (session?.user as any)?.role;
  const n = normalizeRole(rawRole);
  const roleSlug: "wholesaler" | "retailer" =
    n === UserRole.Wholesaler ? "wholesaler" : "retailer";

  return <SubscriptionSuccessClient role={roleSlug} />;
}
