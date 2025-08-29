// app/[role]/products/request/page.tsx
import ProductRequestForm from "@/app/components/productrequest/ProductRequestForm";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";
import type { ProductRequestMessages } from "@/app/types/productRequest/product-request";

type Role = "wholesaler" | "retailer";

type PageProps = {
  params: { role: Role };
  searchParams: { locale?: string };
};

export default async function RequestProductPage({ searchParams }: PageProps) {
  // SSR messages (غیرهاردکد)
  const locale = searchParams?.locale ?? "fa";
  const base = typeof getUserProductMessages === "function"
    ? getUserProductMessages("fa")
    : ({} as any);

  // اگر در سیستم متن‌ها بخش اختصاصی درخواست ندارید،
  // این نگاشت را به ساختار خودتان وصل کنید.
  const messages: ProductRequestMessages = {
    title: base?.request?.title ?? "درخواست محصول",
    subtitle:
      base?.request?.subtitle ??
      "در صورتی که محصول موردنظر شما در دیتابیس ما وجود نداشته باشد، می‌توانید از طریق این فرم آن را درخواست نمایید. محصولات جدید پس از تأیید کارشناسان به نرخین اضافه می‌شود.",
    placeholder: base?.request?.placeholder ?? "مشخصات محصول مورد نظر را وارد نمایید",
    submit: base?.request?.submit ?? "ارسال درخواست",
  };

  return (
    <div dir="rtl" className="container mx-auto px-3 py-5">
      <ProductRequestForm messages={messages} />
    </div>
  );
}
