export interface Admin {
  id: number | string;
  fullName?: string;
  phone?: string;
  cityName?: string;
  // This User type should match what your API returns for an admin
}

export interface NewAdminFormData {
  fullName: string;
  phone: string;
  cityId: number | null;
}

export interface AdminAccess {
  saveProduct: boolean;
  changeUserState: boolean;
  changeShopState: boolean;
  changeAccountState: boolean;
}

export interface PaginatedAdminsResponse {
  users: Admin[];
  totalCount: number;
}