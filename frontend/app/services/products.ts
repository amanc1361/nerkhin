// فرض کنید apiService.ts در مسیر ../apiService یا مشابه قرار دارد.
// و اینترفیس‌ها از فایل types.ts ایمپورت شده‌اند.
import apiService from '../services/apiService';
import {
  Product,
  Shop,
  Category,
  Brand,
  Model,
  Filter,
  ProductRequest,
  SuccessResponse,
  ProductCreationData,
  ProductUpdateData,
  BrandCreationData,
  ModelCreationData,
  FilterCreationData,
  UserProductCreationData
} from '../types/types'; // مسیر به فایل اینترفیس‌ها

// --- Favorites ---
export const getMyFavoriteProducts = (): Promise<Product[]> => {
  return apiService.get<Product[]>({
    url: '/favorite-product/my-favorite-products',
  
  });
};

export const getMyFavoriteShops = (): Promise<Shop[]> => { // نام تابع از getMyFavoriteShop به getMyFavoriteShops تغییر کرد
  return apiService.get<Shop[]>({
    url: '/favorite-account/my-favorite-accounts',

  });
};

// --- Products ---
export const getAllProducts = (filterBody: Record<string, any> = {}): Promise<Product[]> => {
  // API شما برای دریافت همه محصولات از POST استفاده می‌کند، که غیرمعمول است
  // اگر این endpoint از GET پشتیبانی می‌کند، بهتر است به apiService.get تغییر یابد
  // یا اگر بدنه برای فیلترینگ است، نوع filterBody را دقیق‌تر مشخص کنید.
  return apiService.post<Product[]>({
    url: '/product/fetch-products',
    body: filterBody, // در کد اصلی شما {} بود
   
  });
};

export const getSingleProduct = (id: number): Promise<Product> => {
  return apiService.get<Product>({
    url: `/product/fetch/${id}`,
   
  });
};

export const getShopProducts = (shopId: number): Promise<Product[]> => { // پارامتر از id به shopId تغییر کرد
  return apiService.get<Product[]>({
    url: `/user-product/fetch-shops/${shopId}`, // نام متغیر در URL نیز اصلاح شد
   
  });
};

export const getAllProductsByCategoryId = (categoryId: number): Promise<Product[]> => {
  return apiService.post<Product[]>({
    url: '/user-product/fetch-products', // این URL با getAllProducts یکی است، اطمینان حاصل کنید درست است
    body: { categoryId },
   
  });
};

export const createProduct = (data: ProductCreationData): Promise<Product> => { // یا SuccessResponse
  return apiService.post<Product>({
    url: '/product/create',
    body: data,
   
  });
};

export const updateProduct = (data: ProductUpdateData): Promise<Product> => { // یا SuccessResponse
  return apiService.put<Product>({ // از put استفاده شد چون عملیات update است
    url: '/product/update', // مطمئن شوید API شما از PUT برای این endpoint پشتیبانی می‌کند
    body: data,
   
  });
};

export const deleteProduct = (productId: number): Promise<SuccessResponse> => {
  return apiService.post<SuccessResponse>({ // یا اگر API از متد DELETE پشتیبانی می‌کند: apiService.delete
    url: '/product/delete',
    body: { ids: [productId] }, // API شما انتظار یک آرایه از ID ها را دارد
   
  });
};

// --- Product Requests ---
export const getAllProductRequests = (): Promise<ProductRequest[]> => {
  return apiService.get<ProductRequest[]>({
    url: '/product-request/fetch-all',
   
  });
};

export const getProductRequest = (id: number): Promise<ProductRequest> => {
  return apiService.get<ProductRequest>({
    url: `/product-request/fetch/${id}`,
   
  });
};

export const markProductRequestAsChecked = (productRequestId: number): Promise<SuccessResponse> => {
  return apiService.post<SuccessResponse>({
    url: '/product-request/mark-as-checked',
    body: { productRequestId },
   
  });
};

// --- Categories ---
export const getCategories = (): Promise<Category[]> => {
  return apiService.get<Category[]>({
    url: '/product-category/fetch-main-categories',
   
  });
};

export const getSubCategories = (parentId: number): Promise<Category[]> => { // نام پارامتر به parentId تغییر کرد
  return apiService.get<Category[]>({
    url: `/product-category/fetch-sub-categories/${parentId}`,
   
  });
};
// تابع getAllSubCategories در کد شما دقیقاً مشابه getSubCategory بود، در صورت نیاز آن را هم مشابه همین بنویسید.

export const deleteCategory = (categoryId: number): Promise<SuccessResponse> => {
  return apiService.post<SuccessResponse>({
    url: '/product-category/delete',
    body: { ids: [categoryId] },
   
  });
};

// --- Brands ---
export const getBrands = (filterParams?: Record<string, any>): Promise<Brand[]> => {
  // تابع getBrands در کد شما یکبار بدون پارامتر و یکبار با id بود.
  // اگر بدون پارامتر همه برندها را برمی‌گرداند:
  return apiService.get<Brand[]>({
    url: '/product-brand/fetch-all', // این URL عمومی‌تر به نظر می‌رسد
    params: filterParams, // برای فیلترینگ احتمالی
   
  });
};

export const getBrandsBySomethingId = (id: number): Promise<Brand[]> => { // نام تابع برای وضوح تغییر کرد
  // اگر منظور /product-brand/fetch-all/{id} بوده که id یک پارامتر فیلتر است:
  return apiService.get<Brand[]>({
    url: `/product-brand/fetch-all/${id}`, // یا اگر id در query params باید باشد، از params استفاده کنید
   
  });
};


export const createBrand = (data: BrandCreationData): Promise<Brand> => { // یا SuccessResponse
  // در کد شما body: { state: data } بود. فرض می‌کنیم data مستقیم خود اطلاعات برند است.
  return apiService.post<Brand>({
    url: '/product-brand/create',
    body: data, // اگر API انتظار {state: data} دارد، آن را برگردانید
   
  });
};

export const deleteBrand = (brandId: number): Promise<SuccessResponse> => {
  return apiService.post<SuccessResponse>({
    url: '/product-brand/delete',
    body: { ids: [brandId] },

  });
};

// --- Models ---
export const getAllModelsByBrandId = (brandId: number): Promise<Model[]> => { // نام تابع برای وضوح تغییر کرد
  return apiService.get<Model[]>({
    url: `/product-model/fetch-all/${brandId}`, // فرض بر این است که id همان brandId است
    
  });
};

export const createModel = (data: ModelCreationData): Promise<Model> => { // یا SuccessResponse
  // در کد شما body: { state: data } بود.
  return apiService.post<Model>({
    url: '/product-model/create',
    body: data, // اگر API انتظار {state: data} دارد، آن را برگردانید
    
  });
};

export const deleteModel = (modelId: number): Promise<SuccessResponse> => {
  return apiService.post<SuccessResponse>({
    url: '/product-model/delete',
    body: { ids: [modelId] },
    
  });
};

// --- Filters ---
export const getAllFiltersByCategoryId = (categoryId: number): Promise<Filter[]> => { // نام تابع برای وضوح تغییر کرد
  return apiService.get<Filter[]>({
    url: `/product-filter/fetch-all/${categoryId}`, // فرض بر این است که id همان categoryId است
    
  });
};

export const createFilter = (data: FilterCreationData): Promise<Filter> => { // یا SuccessResponse
  // در کد شما body: { filterData: data } بود.
  return apiService.post<Filter>({
    url: '/product-filter/create',
    body: data, // اگر API انتظار {filterData: data} دارد، آن را برگردانید
    
  });
};

export const deleteFilter = (filterIds: number[]): Promise<SuccessResponse> => {
  return apiService.post<SuccessResponse>({
    url: '/product-filter/delete',
    body: { ids: filterIds },
    
  });
};

// --- User Products (ارتباط کاربر با محصول، شاید منظور قیمت‌گذاری یا موجودی کاربر برای محصول باشد) ---
export const createUserProduct = (data: UserProductCreationData): Promise<SuccessResponse> => { // یا یک نوع خاص برای UserProduct
  // در کد شما body: { data } بود.
  return apiService.post<SuccessResponse>({
    url: '/user-product/create',
    body: data, // اگر API انتظار {data: data} دارد، آن را برگردانید
    
  });
};

// --- Brand Models by Category (این تابع خاص به نظر می‌رسد) ---
interface BrandModelInCategory { // یک مثال برای اینترفیس پاسخ
  brand: Brand;
  models: Model[];
}
export const getBrandModelsByCategoryId = (categoryId: number): Promise<BrandModelInCategory[]> => {
  return apiService.get<BrandModelInCategory[]>({
    url: `/product-category/fetch-brand-models/${categoryId}`,
    
  });
};

export const getProductRequestsAPI = async (): Promise<ProductRequest[]> => {

  return apiService.get<ProductRequest[]>({
    url: '/product-request/fetch-all',
    
  });
};