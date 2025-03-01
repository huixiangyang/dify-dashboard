'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  getTokens, 
  clearAuth, 
  isLoggedIn, 
  getApiDomain, 
  getUserInfo, 
  UserInfo, 
  fetchUserInfo, 
  saveUserInfo,
  refreshToken,
  saveAuth
} from '@/services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  apiDomain: string;
  userInfo: UserInfo | null;
  logout: () => void;
  setAuth: (isAuth: boolean) => void;
  setUserData: (data: UserInfo) => void;
  refreshUserInfo: () => Promise<UserInfo | null>;
  refreshAuthToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  apiDomain: '',
  userInfo: null,
  logout: () => {},
  setAuth: () => {},
  setUserData: () => {},
  refreshUserInfo: async () => null,
  refreshAuthToken: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiDomain, setApiDomain] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 使用useEffect确保代码只在客户端执行
    const initAuth = () => {
      // 检查认证状态
      const authStatus = isLoggedIn();
      setIsAuthenticated(authStatus);
      
      const domain = getApiDomain();
      setApiDomain(domain);
      console.log('apiDomain:', domain);
      
      // 获取存储的用户信息
      const storedUserInfo = getUserInfo();
      if (storedUserInfo) {
        setUserInfo(storedUserInfo);
      }
      
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  // 刷新用户信息
  const refreshUserInfo = async () => {
    const tokens = getTokens();
    const domain = getApiDomain();
    
    if (tokens && domain) {
      console.log('开始获取用户信息...');
      try {
        const userInfoData = await fetchUserInfo(domain, tokens.accessToken);
        console.log('获取到用户信息:', userInfoData);
        if (userInfoData) {
          setUserInfo(userInfoData);
          saveUserInfo(userInfoData);
          console.log('用户信息已更新');
          return userInfoData;
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    } else {
      console.log('无法获取用户信息: 缺少令牌或域名');
    }
    return null;
  };

  // 刷新认证 token
  const refreshAuthToken = async (): Promise<boolean> => {
    const tokens = getTokens();
    const domain = getApiDomain();
    
    if (!tokens || !domain) {
      console.log('无法刷新 token: 缺少令牌或域名');
      return false;
    }
    
    try {
      console.log('开始刷新 token...');
      const response = await refreshToken(domain, tokens.refreshToken);
      
      if (response.result === 'success' && response.data) {
        const { access_token, refresh_token } = response.data;
        saveAuth(access_token, refresh_token, domain);
        console.log('token 刷新成功');
        return true;
      } else {
        console.error('刷新 token 失败:', response.message);
        // 如果刷新失败，可能需要重新登录
        if (pathname !== '/' && pathname !== '/login') {
          logout();
        }
        return false;
      }
    } catch (error) {
      console.error('刷新 token 异常:', error);
      return false;
    }
  };

  const logout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setUserInfo(null);
    router.push('/');
  };

  const setAuth = (isAuth: boolean) => {
    setIsAuthenticated(isAuth);
  };

  const setUserData = (data: UserInfo) => {
    setUserInfo(data);
    saveUserInfo(data);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      apiDomain, 
      userInfo, 
      logout, 
      setAuth, 
      setUserData,
      refreshUserInfo,
      refreshAuthToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
