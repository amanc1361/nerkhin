// مسیر: app/services/productRequestApi.ts

export const productRequestApi = {
  changeState: ({ requestId, targetState }: { requestId: number; targetState: number }) => ({
    url: `/product-request/change-state`,
    method: "post" as const,
    body: {
      id: requestId,
      state: targetState,
    },
  }),
};
