import Link from "next/link";
import Image from "next/image";
import { Category } from "@/app/types/category/categoryManagement";

export default function CategoryCard({ item, href }: { item: Category; href: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition bg-white"
    >
      <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            width={120}
            height={120}
            alt={item.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
      </div>
      <div className="text-sm text-gray-700 group-hover:text-gray-900 line-clamp-1">{item.title}</div>
    </Link>
  );
}
