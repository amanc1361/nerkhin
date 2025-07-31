// export const API_BASE_URL: string = "https://nerrkhin.com/api"; 

import { absApiUrl } from "@/app/utils/absurl";

// export const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '/api/go';


export const API_BASE_URL = absApiUrl('');
export const REFRESH_TOKEN_API_PATH: string = "/auth/refresh-token"; 