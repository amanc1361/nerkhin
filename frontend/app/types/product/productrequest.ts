export enum RequestState {
  NewRequest = 1,
  Checked = 2,
}

export interface ProductRequest {
  id: number;
  userId: number;
  description: string;
  state: RequestState;
}

export interface ProductRequestViewModel extends ProductRequest {
  userName: string;
  phoneNumber: string;
  userType: number;
  city: string;
}
