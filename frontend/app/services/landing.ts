
import apiService from '../services/apiService'; 

export interface LandingPageInfo {
  heroSection?: {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    ctaButton?: {
      text: string;
      link: string;
    };
  };
  featuresSection?: Array<{
    id: string | number;
    title: string;
    description: string;
    icon?: string;
  }>;
  testimonialsSection?: Array<{
    id: string | number;
    quote: string;
    author: string;
    company?: string;
  }>;
}



export const getLandingPageInfo = (): Promise<LandingPageInfo> => {

  return apiService.get<LandingPageInfo>({
    url: '/landing-info',

  });
};

