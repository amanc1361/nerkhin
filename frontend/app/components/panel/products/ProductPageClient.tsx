"use client";

import { useState } from "react";
import RegisteredProductsTab from "./RegisteredProductsTab";
import RequestedProductsTab from "./RequestedProductsTab";
import { productMessages as msg } from "@/app/constants/productMessages";

type TabType = "requested" | "registered";

const ProductsPageClient = () => {
  const [activeTab, setActiveTab] = useState<TabType>("registered");

  return (
    <div className="space-y-6">

      {/* تب‌ها (دو تب کل عرض صفحه با رنگ برجسته) */}
      <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-gray-300 shadow-sm">
        <button
          onClick={() => setActiveTab("requested")}
          className={`text-center py-3 font-semibold transition-colors duration-200 ${
            activeTab === "requested"
              ? "bg-blue-dark text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {msg.requestedProducts}
        </button>
        <button
          onClick={() => setActiveTab("registered")}
          className={`text-center py-3 font-semibold transition-colors duration-200 ${
            activeTab === "registered"
              ? "bg-blue-dark text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {msg.registeredProducts}
        </button>
      </div>

      {/* محتوای تب */}
      <div className="p-4">
        {activeTab === "requested" && <RequestedProductsTab />}
        {activeTab === "registered" && <RegisteredProductsTab />}
      </div>
    </div>
  );
};

export default ProductsPageClient;
