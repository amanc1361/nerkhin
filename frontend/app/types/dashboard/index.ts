

export interface User {
  id: string | number;
  fullName?: string; 
}

export interface Report {
  id: string | number;
  title?: string; 
  description?: string;
}

export interface ProductRequest {
  id: string | number;
  description: string;
  state: number; 
}

export interface City {
  id: number;
  name: string;
}