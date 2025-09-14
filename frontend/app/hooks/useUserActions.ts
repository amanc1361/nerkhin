"use client";
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuthenticatedApi } from "./useAuthenticatedApi";
import { userManagementMessages as messages } from "@/app/constants/userManagementMessages";
import { SuccessResponse, NewUserFormData, User } from "@/app/types/types";
import { userApi } from "@/app/services/userApi";
import { ApiError } from "@/app/services/apiService";

// Action Types
type ActionType = "approve" | "reject" | "add" | "delete" | "toggleActive" | "updateLimit" | "deleteDevice" | "deleteAllDevices" | "updateAllLimits";

// Payload Types
type ToggleActivePayload = { userId: number; nextActive: boolean };
type DeletePayload = { userId: number }; // Can be used for deleting a user
type UpdateLimitPayload = { userId: number; limit: number };
type DeleteDevicePayload = { userId: number; deviceId: string };
type UpdateAllLimitsPayload = { limit: number }; // <-- ADDED: Payload for updating all limits
type DeleteAllDevicesPayload = { userId: number }; // <-- ADDED: Payload for deleting all devices

// Union of all possible payloads
type ActionPayload = 
  | User 
  | NewUserFormData 
  | ToggleActivePayload 
  | DeletePayload 
  | UpdateLimitPayload 
  | DeleteDevicePayload 
  | UpdateAllLimitsPayload
  | DeleteAllDevicesPayload;

export const useUserActions = (onSuccess: () => void) => {
  const { api } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performAction = useCallback(
    async (action: ActionType, data: ActionPayload) => {
      setIsSubmitting(true);
      try {
        let successMessage = "";

        if (action === "approve") {
          await api.post<SuccessResponse>(userApi.changeState({ userId: (data as User).id, targetState: 5 }));
          successMessage = messages.userApprovedSuccess;
        } else if (action === "reject") {
          await api.post<SuccessResponse>(userApi.changeState({ userId: (data as User).id, targetState: 2 }));
          successMessage = messages.userRejectedSuccess;
        } else if (action === "add") {
          await api.post<SuccessResponse>(userApi.create(data as NewUserFormData));
          successMessage = messages.userAddedSuccess;
        } else if (action === "delete") {
          const { userId } = data as DeletePayload;
          await api.delete<SuccessResponse>(userApi.deleteUser(userId));
          successMessage = messages.userDeletedSuccess ?? "کاربر با موفقیت حذف شد.";
        } else if (action === "toggleActive") {
          const { userId, nextActive } = data as ToggleActivePayload;
          await api.post<SuccessResponse>(userApi.changeState({ userId, targetState: nextActive ? 5 : 3 }));
          successMessage = nextActive ? (messages.userActivatedSuccess ?? "کاربر فعال شد.") : (messages.userDeactivatedSuccess ?? "کاربر غیرفعال شد.");
        } else if (action === "updateLimit") {
            await api.put<SuccessResponse>(userApi.updateDeviceLimit(data as UpdateLimitPayload));
            successMessage = "محدودیت دستگاه با موفقیت به‌روز شد.";
        } else if (action === "deleteDevice") {
          const { userId, deviceId } = data as DeleteDevicePayload;
          await api.delete<SuccessResponse>(userApi.deleteUserDevice(userId, deviceId));
          successMessage = "دستگاه با موفقیت حذف شد.";
        } else if (action === "deleteAllDevices") {
          // --- CORRECTED LOGIC ---
          const { userId } = data as DeleteAllDevicesPayload;
          await api.delete<SuccessResponse>(userApi.deleteAllUserDevices(userId));
          successMessage = "تمام دستگاه‌های کاربر با موفقیت حذف شدند.";
        } else if (action === "updateAllLimits") {
          // --- CORRECTED LOGIC ---
          await api.put<SuccessResponse>(userApi.updateAllDeviceLimits(data as UpdateAllLimitsPayload));
          successMessage = "محدودیت دستگاه همه‌ی کاربران با موفقیت به‌روز شد.";
        }

        toast.success(successMessage);
        onSuccess();
      } catch (error) {
        const message = error instanceof ApiError ? error.message : messages.genericError;
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, onSuccess]
  );

  return { isSubmitting, performAction };
};