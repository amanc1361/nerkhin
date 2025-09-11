export interface City {
  id: number;
  name: string;
  type: number; 
}


export interface NewCityFormData {
  name: string;
  type: number | null; // null برای زمانی که هنوز انتخاب نشده
}
export interface CreateCityResponse {
  success: boolean;
  message?: string;
  city?: City; // اختیاری: خود آبجکت شهر ایجاد شده
}
export interface DeleteCitiesResponse {
  success: boolean;
  message?: string;
  deletedCount?: number; 
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
  brandId?: number;
  modelId?: number;
  images?: string[];
createdAt?:string;
updatedAt?:string;

  // ... سایر مشخصات محصول
}

export interface Shop { // یا Account
  id: number;
  name: string;
  createdAt:string;
  updatedAt:string;
  logoUrl:string;

  // ... سایر مشخصات فروشگاه
}

export interface Category {
    id: number;
    parentId?: number | null;
    imageUrl:string;
    title:string;
    subCategories?: Category[];
  // ... سایر مشخصات دسته‌بندی
}

export interface Brand {
  id: number;
  name: string;
  title:string;
  categoryId:number;
  logoUrl?: string;
  // ... سایر مشخصات برند
}

export interface Model {
  id: number;
  title: string;
  brandId : number;
  categoryId: number;
  // ... سایر مشخصات مدل
}

export interface Filter {
  id: number;
  name: string;
  categoryId?: number;
  options?: Array<{ value: string | number; label: string }>;
  // ... سایر مشخصات فیلتر
}

export interface ProductRequest {
  id: number;
  requestedProductName: string;
  status: 'pending' | 'checked' | 'rejected';
  notes?: string;
  description?:string;
  state?:number;
  // ... سایر مشخصات درخواست محصول
}

// برای پاسخ‌های عمومی موفقیت‌آمیز یا پیام‌محور
export interface SuccessResponse {
  success: boolean;
  message?: string;
}

// برای داده‌های ایجاد یا ویرایش که ممکن است بخشی از موجودیت باشند
export type ProductCreationData = Omit<Product, 'id'>; // یا هر فیلدی که برای ایجاد لازم است
export type ProductUpdateData = Partial<Product> & { id: number };

export type BrandCreationData = { name: string /* ...سایر فیلدهای لازم */ }; // در کد شما { state: data } بود
export type ModelCreationData = { name: string; brandId: number /* ... */ }; // در کد شما { state: data } بود
export type FilterCreationData = { name: string; categoryId: number; options: any[] /* ... */ }; // در کد شما { filterData: data } بود
export type UserProductCreationData = { productId: number; userId: number; price?: number /* ... */ }; // در کد شما { data } بود

// ===> این اینترفیس‌ها را در یک فایل جداگانه (مثلاً 'types.ts' یا 'reportTypes.ts') قرار دهید و ایمپورت کنید <===

export type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected' | 'closed';

export interface Report {
  id: number;
  title: string;
  description: string;
  reporterUserId?: number; // شناسه کاربری که گزارش داده
  reportedEntityType?: 'product' | 'user' | 'comment' | 'shop'; // نوع موجودیتی که گزارش شده
  reportedEntityId?: number; // شناسه موجودیتی که گزارش شده
  status: ReportStatus;
  createdAt: string; // تاریخ ایجاد به فرمت ISO (e.g., "2023-10-26T10:00:00Z")
  updatedAt: string; // آخرین تاریخ به‌روزرسانی به فرمت ISO
  resolutionNotes?: string; // یادداشت‌های مربوط به بررسی و نتیجه گزارش
  // ... سایر مشخصات یک گزارش
}

// پارامترهای فیلتر برای دریافت لیست گزارشات
export interface ReportFilters {
  status?: ReportStatus;
  reporterUserId?: number;
  reportedEntityType?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Report | string; // فیلد مورد نظر برای مرتب‌سازی
  sortOrder?: 'asc' | 'desc'; // ترتیب مرتب‌سازی
  // ... سایر فیلترهای ممکن
}

// داده‌های لازم برای تغییر وضعیت یک گزارش
export interface ChangeReportStatePayload {
  reportId: number;
  newState: ReportStatus;
  resolutionNotes?: string; // یادداشت‌های مربوط به تغییر وضعیت
}


export interface SuccessResponse {
  success: boolean;
  message?: string;
}


export interface PaginatedReportsResponse {
  items: Report[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  // ... سایر اطلاعات صفحه‌بندی
}
// ===> این اینترفیس‌ها را در یک فایل جداگانه (مثلاً 'types.ts' یا 'subscriptionTypes.ts') قرار دهید و ایمپورت کنید <===

export type SubscriptionStatus = 'active' | 'inactive' | 'pending_payment' | 'expired' | 'cancelled' | 'on_hold';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type TransactionPurpose = 'initial_purchase' | 'renewal' | 'upgrade' | 'downgrade' | 'refund';

export interface Subscription {
  id: string | number;
  userId?: string | number; // معمولاً از توکن خوانده می‌شود
  planId: string | number;
  planName?: string;
  status: SubscriptionStatus;
  price: number;
  currency: string; // e.g., "IRR", "USD"
  startDate: string; // تاریخ شروع به فرمت ISO (e.g., "2023-10-26T10:00:00Z")
  endDate: string;   // تاریخ پایان به فرمت ISO
  nextBillingDate?: string; // تاریخ صورتحساب بعدی برای اشتراک‌های دوره‌ای
  autoRenew?: boolean;
  // ... سایر مشخصات یک اشتراک
}

export interface Transaction {
  id: string | number;
  userId?: string | number;
  subscriptionId?: string | number; // اشتراکی که این تراکنش به آن مرتبط است
  amount: number;
  currency: string;
  status: TransactionStatus;
  purpose: TransactionPurpose; // هدف از تراکنش
  gatewayTransactionId?: string; // شناسه تراکنش در درگاه پرداخت
  paymentMethod?: string; // روش پرداخت
  description?: string;
  createdAt: string; // تاریخ ایجاد به فرمت ISO
  updatedAt: string; // آخرین تاریخ به‌روزرسانی به فرمت ISO
  // ... سایر مشخصات یک تراکنش
}

// داده‌های لازم برای ایجاد یک اشتراک جدید
export interface SubscriptionCreationPayload {
  planId: string | number;
  // userId?: string | number; // معمولاً سمت سرور از توکن خوانده می‌شود
  paymentNonce?: string; // یا هر توکن پرداختی که از سمت کلاینت یا درگاه دریافت می‌شود
  // ... سایر فیلدهای مورد نیاز برای ایجاد اشتراک، مانند کد تخفیف و ...
}

// داده‌های لازم برای به‌روزرسانی یک اشتراک
export interface SubscriptionUpdatePayload {
  id: string | number; // شناسه اشتراکی که باید آپدیت شود
  planId?: string | number; // برای تغییر طرح
  status?: SubscriptionStatus; // برای تغییر وضعیت دستی (مثلاً لغو توسط ادمین)
  autoRenew?: boolean;
  // ... سایر فیلدهایی که قابل آپدیت هستند
}

// ===> این اینترفیس‌ها را در یک فایل جداگانه (مثلاً 'types.ts' یا 'userTypes.ts') قرار دهید و ایمپورت کنید <===

export type UserRole = 'user' | 'admin' | 'editor' | 'content_manager' | string; // یا هر نقش دیگری

export interface User {
  id:  number;
  state:number;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  cityName?:string;
  phone?:string;
  isActive: boolean;
  roles: UserRole;
  createdAt: string; // تاریخ ایجاد به فرمت ISO (e.g., "2023-10-26T10:00:00Z")
  lastLoginAt?: string; // آخرین تاریخ ورود به فرمت ISO
  // ... سایر مشخصات یک کاربر
}

// مثالی برای دسترسی‌های خاص ادمین
export interface AdminPermission {
  resource: string; // مثلا 'users', 'products', 'settings'
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  // ... سایر سطوح دسترسی
}

export interface AdminAccess {
  userId: string | number;
  permissions: AdminPermission[];
  // ... سایر جزئیات مربوط به دسترسی‌های ادمین یک کاربر خاص
}

// پارامترهای فیلتر برای دریافت لیست کاربران
export interface UserFilters {
  state?: number | string; // برای مطابقت با body: { state: 1 } در کد اصلی
  role?: UserRole;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  // ... سایر فیلترهای ممکن
}

// داده‌های لازم برای به‌روزرسانی دسترسی‌های ادمین
export interface AdminAccessUpdatePayload {
  // این ساختار بستگی به API شما دارد.
  // ممکن است یک لیست کامل از دسترسی‌ها باشد:
  permissions: AdminPermission[];
  // یا تغییرات خاصی را ارسال کنید:
  // grantPermissions?: Array<{ resource: string; levels: string[] }>;
  // revokePermissions?: Array<{ resource: string; levels: string[] }>;
}
export interface PaginatedUsersResponse {
  users: User[];
  totalCount: number;
}

export interface NewUserFormData {
  fullName: string;
  phone: string;
  role: number | null;
  cityId: number | null;
}
export interface UserViewModel extends User {
  cityName: string;
  subscriptionDaysLeft: number;
}

export interface FetchUsersByFilterResponse {
  users: UserViewModel[];
  totalCount: number;
}
