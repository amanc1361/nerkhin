import Link from "next/link";
import Image from "next/image";
import { Category } from "@/app/types/category/categoryManagement";

export default function CategoryCard({ item, href }: { item: Category; href: string }) {
  return (
    <Link href={href} className="group block">
      {/* <div className="rounded-2xl p-2 border border-slate-200 bg-white shadow-sm hover:shadow-md transition"> */}
        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
          {item.imageUrl ? (
            <Image src={"https://nerrkhin.com/uploads/"+item.imageUrl} alt={item.title} width={300} height={300} className="object-cover w-full h-full group-hover:scale-[1.03] transition" />
          ) : <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />}
        </div>
        <div className="mt-2 text-center text-[13px] md:text-sm text-slate-800 line-clamp-1">{item.title}</div>
      {/* </div> */}
    </Link>
  );
}
