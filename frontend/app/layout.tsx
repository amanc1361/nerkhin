

import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';




import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { siteTexts } from './constants/string';
import AuthProvider from './AuthProvider';

export const metadata: Metadata = {
  title: siteTexts.siteName, 
  description: siteTexts.siteDescription, 
 
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fa" dir="rtl">
      <head />
      <body className="font-Vazirmatn text-gray-dark bg-gray-light">
      <AuthProvider>
        {children}
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        </AuthProvider>
      </body>
    </html>
  );
}