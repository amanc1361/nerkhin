
import apiService from '../services/apiService';
import {
  Report,
  ReportFilters,
  ChangeReportStatePayload,
  
} from '../types/types'; 

export const getReports = (filters: ReportFilters): Promise<Report[]> => {
  return apiService.post<Report[]>({
    url: '/report/fetch-reports',
    body: { state: filters }, 

  });
};


export const getSingleReport = (id: number): Promise<Report> => {
  return apiService.get<Report>({
    url: `/report/fetch/${id}`,
   
  });
};


export const changeReportState = (payload: ChangeReportStatePayload): Promise<Report> => {
  return apiService.post<Report>({ 
    url: `/report/change-state`,
    body: { state: payload }, 

  });
};

export const getNewReportsAPI = async (params: { state: number }): Promise<Report[]> => {

  return apiService.post<Report[]>({ // Assuming API returns RawApiReport[]
    url: '/report/fetch-reports',
    body: params,

  });


};