
import apiService from '../services/apiService';
import { ReportViewModel } from '../types/report/reportManagement';
import { ChangeReportStatePayload, ReportFilters } from '../types/types';


export const getReports = (filters: ReportFilters): Promise<ReportViewModel[]> => {
  return apiService.post<ReportViewModel[]>({
    url: '/report/fetch-reports',
    body: { state: filters }, 

  });
};


export const getSingleReport = (id: number): Promise<ReportViewModel> => {
  return apiService.get<ReportViewModel>({
    url: `/report/fetch/${id}`,
   
  });
};


export const changeReportState = (payload: ChangeReportStatePayload): Promise<ReportViewModel> => {
  return apiService.post<ReportViewModel>({ 
    url: `/report/change-state`,
    body: { state: payload }, 

  });
};

export const getNewReportsAPI = async (params: { state: number }): Promise<ReportViewModel[]> => {

  return apiService.post<ReportViewModel[]>({ // Assuming API returns RawApiReport[]
    url: '/report/fetch-reports',
    body: params,

  });


};