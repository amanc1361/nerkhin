

import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';




import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { siteTexts } from './constants/string';
import AuthProvider from './AuthProvider';
import InitServiceWorker from './InitServiceWorker';
import InstallPrompt from './components/pwa/InstallPrompt';

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
       <head>
        {/* PWA essentials */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0f172a" />

        {/* iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="font-Vazirmatn text-gray-dark bg-gray-light">
      <AuthProvider>
      <InitServiceWorker />
        {/* دکمه نصب (اندروید) + راهنما (iOS) */}
        <InstallPrompt />
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