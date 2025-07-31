// This interface should match the structure of a subscription from your Go backend
export interface Subscription {
  id: number | string;
  price: number | string; // Using string as well, since your form uses string for price
  numberOfDays: number;
  // You might have other properties like a plan name, e.g., 'یک ماهه'
  planName?: string; 
}

// Data for the 'Add New Subscription' form
export interface NewSubscriptionFormData {
  price: string;
  numberOfDays: number | null;
}

// Data for the 'Update Subscription' form
export interface UpdateSubscriptionFormData {
  id: number | string;
  price: string;
}

// A generic success response from the API
export interface SuccessResponse {
  success: boolean;
  message?: string;
}