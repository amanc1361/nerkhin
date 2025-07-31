export interface Report {
  id: number | string;
  title?: string;
  description?: string;
  createdAt: string | Date;
  state: number; // e.g., 1 for new, 2 for checked
  // Add other properties that come from your API for a single report
  targetUserFullName?: string;
  targetUserShopName?: string;
  targetUserPhone?: string;
  targetUserRole?: number | string;
  targetUserCity?: string;
  userFullName?: string;
  userShopName?: string;
  userPhone?: string;
  userRole?: number | string;
  userCity?: string;
}

export interface PaginatedReportsResponse {
  reports: Report[];
  limit:number;
  totalCount: number;
}