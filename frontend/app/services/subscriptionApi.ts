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
};