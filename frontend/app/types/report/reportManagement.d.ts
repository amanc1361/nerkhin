export interface Report {
  id: number ;
  title?: string;
  description?: string;
  createdAt: string | Date;
  state: number;
  userId:number;
  targetUserId:number;

}


export interface PaginatedReportsResponse {
  reports: Report[];
  limit:number;
  totalCount: number;
}
export interface ReportViewModel extends Report {
  userFullName: string;
  userShopName: string;
  userPhone: string;
  userRole: UserRole;
  userCity: string;

  targetUserFullName: string;
  targetUserShopName: string;
  targetUserPhone: string;
  targetUserRole: UserRole;
  targetUserCity: string;
}

export interface FetchReportsByFilterResponse {
  reports: ReportViewModel[];
  totalCount: number;
}