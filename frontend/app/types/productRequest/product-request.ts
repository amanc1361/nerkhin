// types/product-request.ts
export type CreateProductRequestPayload = {
    description: string;
  };
  
  export type CreateProductRequestResponse = {
    id: number;
  };
  
  export type ProductRequestMessages = {
    title: string;
    subtitle: string;
    placeholder: string;
    submit: string;
  };
  