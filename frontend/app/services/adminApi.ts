// Add these to your existing apiDefinitions.ts file
import { NewAdminFormData, AdminAccess } from '@/app/types/admin/adminManagement';

export const adminApi = {
  getAll: (params: { [key: string]: any }) => ({
    url: '/user/fetch-users', // Assuming admins are fetched via user endpoint with a role filter
    method: 'post' as const,
    body: { role: 2, ...params }, // Assuming role 2 is for admins
  }),
  create: (newAdminData: NewAdminFormData) => ({
    url: '/user/add-new-admin',
    method: 'post' as const,
    body: newAdminData,
  }),
  delete: (adminId: number | string) => ({
    url: `/user/delete-admin/${adminId}`,
    method: 'post' as const, // Or DELETE if your API supports it
    body: { adminId },
  }),
  getAccess: (adminId: number | string) => ({
    url: `/user/get-admin-access/${adminId}`,
    method: 'get' as const,
  }),
  updateAccess: (adminId: number | string, accessData: AdminAccess) => ({
    url: `/user/update-admin-access/${adminId}`,
    method: 'post' as const, // Or PUT
    body: accessData,
  }),
};