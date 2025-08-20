import Link from "next/link";
import Image from "next/image";
import { Category } from "@/app/types/category/categoryManagement";

export default function CategoryCard({ item, href }: { item: Category; href: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl p-3 border border-slate-200/70 bg-white/80 backdrop-blur hover:bg-white transition shadow-sm hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
        {item.imageUrl ? (
          <Image src={"https://nerkhin.com/uploads/"+item.imageUrl} alt={item.title} width={160} height={160} className="object-cover w-full h-full group-hover:scale-[1.03] transition" />
        ) : <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />}
      </div>
      <div className="mt-2.5 text-center text-sm text-slate-800 line-clamp-1">{item.title}</div>
    </Link>
  );
}
