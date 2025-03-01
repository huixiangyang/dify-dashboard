'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 执行登出操作
    logout();
    
    // 重定向到首页
    router.push('/');
  }, [logout, router]);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="max-w-md w-full bg-content1 rounded-xl shadow-lg p-6">
        <div className="text-center">
          <p>正在登出...</p>
        </div>
      </div>
    </div>
  );
}
