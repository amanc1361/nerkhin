// Add these to your existing apiDefinitions.ts file
import { NewSubscriptionFormData, UpdateSubscriptionFormData } from '@/app/types/subscription/subscriptionManagement';

export const subscriptionApi = {
  getAll: () => ({
    url: '/subscription/fetch-all',
    method: 'get' as const,
  }),
  create: (data: NewSubscriptionFormData) => ({
    url: '/subscription/create',
    method: 'post' as const,
    body: data,
  }),
  update: (data: UpdateSubscriptionFormData) => ({
    url: '/subscription/update',
    method: 'put' as const, // PUT is more appropriate for updates
    body: data,
  }),
  delete: (ids: Array<number | string>) => ({
    url: '/subscription/batch-delete',
    method: 'post' as const, // Or DELETE
    body: { ids },
  }),
  all: { url: "/subscription/all", method: "get" as const },
  userByCity: (cityId: number | string) => ({ url: `/user-subscription/${cityId}`, method: "get" as const }),
  paymentGatewayInfo: { url: "/user-subscription/fetch-payment-gateway-info", method: "post" as const },
  createUserSubscription: { url: "/user-subscription", method: "post" as const },
  paymentHistory: { url: "/user-subscription/payment-transactions-history", method: "get" as const },
  userSubscriptionList: { url: "/user-subscription/list", method: "get" as const },
};


export type FetchGatewayInfoDTO = {
  cityId: number;
  subscriptionId: number;
  callBackUrl: string;
};
export type CreateUserSubscriptionDTO = {
  authority: string;
};
