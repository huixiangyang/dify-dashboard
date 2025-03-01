"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // 如果用户未认证且不在登录页面，重定向到登录页面
    if (!isAuthenticated && pathname !== "/signin" && !isRedirecting) {
      setIsRedirecting(true);
      router.push("/signin");
    } else if (isAuthenticated && pathname === "/signin" && !isRedirecting) {
      // 如果用户已认证且在登录页面，重定向到首页
      setIsRedirecting(true);
      router.push("/");
    }
  }, [isAuthenticated, router, pathname, isRedirecting]);

  // 如果是登录页面或已认证，渲染子组件
  if (pathname === "/signin" || isAuthenticated) {
    return <>{children}</>;
  }

  // 其他情况不渲染
  return null;
}
