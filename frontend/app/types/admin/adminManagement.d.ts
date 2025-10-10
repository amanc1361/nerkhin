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


// این ساختار دقیقاً معادل ViewModelی است که در بک‌اند ساختیم
export interface AdminUserViewModel {
  id: number;
  fullName: string;
  phone: string;
  isWholesaler: boolean;
  cityName: string | null;
  hasSubscription: boolean;
  daysRemaining: number | null;
  totalPaid: Decimal | number | string; // Type can vary based on library (Prisma/Decimal.js)
}

// برای ارسال فیلترها به سرور
export interface AdminUserFilters {
  is_wholesaler?: boolean;
  has_subscription?: boolean;
}