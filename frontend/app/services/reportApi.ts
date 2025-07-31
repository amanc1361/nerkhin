// Add these to your existing apiDefinitions.ts file

export const reportApi = {
  // This should accept pagination and filter params
  getAll: (params: { [key: string]: any }) => ({
    url: '/report/fetch-reports',
    method: 'post' as const,
    body: params,
  }),
  // This API seems to be missing from your original code, but is needed
  getById: (id: number | string) => ({
    url: `/report/fetch/${id}`,
    method: 'get' as const,
  }),
  changeState: (payload: { reportId: number | string; targetState: number }) => ({
    url: '/report/change-state',
    method: 'post' as const,
    body: payload,
  }),
};