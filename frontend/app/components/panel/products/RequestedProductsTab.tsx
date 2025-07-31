"use client";


import { useRequestedProducts } from "@/app/hooks/useProductRequest";
import { ProductRequestViewModel } from "@/app/types/product/productrequest";
import { useState } from "react";
import { productMessages as msg } from "@/app/constants/productMessages";
import { useProductRequestActions } from "@/app/hooks/useProductRequestActions";
const RequestedProductsTab = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const { requests, loading, error } = useRequestedProducts(refreshKey);
  const { performAction, isSubmitting } = useProductRequestActions(() => setRefreshKey(prev => prev + 1));

  const handleCheck = (request: ProductRequestViewModel) => {
    performAction("markAsChecked", request);
  };

  return (
    <div className="space-y-4">
      {loading && <div className="text-center">{msg.loading}</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

      {!loading && requests.length === 0 && (
        <div className="text-center text-gray-500">{msg.noProductRequests}</div>
      )}

      <div className="grid gap-4">
        {requests.map((req) => (
          <div key={req.id} className="card shadow p-4 space-y-2">
            <div><span className="font-semibold">{msg.requestUser}:</span> {req.userName}</div>
            <div><span className="font-semibold">{msg.city}:</span> {req.city}</div>
            <div><span className="font-semibold">{msg.userType}:</span> {renderUserType(req.userType)}</div>
            <div><span className="font-semibold">{msg.phoneNumber}:</span> {req.phoneNumber || "***"}</div>
            <div><span className="font-semibold">{msg.description}:</span> {req.description}</div>

            {req.state === 1 && (
              <button
                onClick={() => handleCheck(req)}
                disabled={isSubmitting}
                className="btn btn-sm btn-outline"
              >
                {msg.markAsChecked}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const renderUserType = (type: number) => {
  switch (type) {
    case 1:
      return "فروشنده";
    case 2:
      return "خریدار";
    default:
      return "نامشخص";
  }
};

export default RequestedProductsTab;
