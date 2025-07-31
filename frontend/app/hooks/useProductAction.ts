import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { toast } from "react-toastify";
import { productMessages } from "@/app/constants/productMessages";
import { productApi } from "@/app/services/brandapi";

export function useProductActions(onDone: () => void) {
  const { api } = useAuthenticatedApi();

  const deleteProduct = async (id: number | string) => {
    try {   
      await api.delete(productApi.delete(id));
      toast.success(productMessages.deleteSuccess);
      onDone();
    } catch (err) {
      toast.error(productMessages.deleteError);
    }
  };

  const updateProduct = async (formData: FormData) => {
    try {
      await api.put(productApi.update(formData));
      toast.success(productMessages.updateSuccess);
      onDone();
    } catch (err) {
      toast.error(productMessages.updateError);
    }
  };

  return { deleteProduct, updateProduct };
}
