'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { LogOutIcon } from 'lucide-react';

const Logoutbtn: React.FC = () => {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <button
      onClick={logout}
      className="flex flex-row gap-2 bg-red-500 px-5 py-3 rounded-md"
    >
      <LogOutIcon />
      <div>خروج از حساب</div>
    </button>
  );
};

export default Logoutbtn;
