// 认证服务

// 用户登录响应类型
export interface LoginResponse {
  result: string;
  data?: {
    access_token: string;
    refresh_token: string;
  };
  message?: string;
}

// 用户信息类型
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatar_url?: string | null;
  is_password_set?: boolean;
  interface_language?: string;
  interface_theme?: string;
  timezone?: string;
  last_login_at?: number;
  last_login_ip?: string;
  created_at?: number;
}

// 登录函数
export async function login(
  email: string,
  password: string,
  domain: string,
  rememberMe: boolean = true
): Promise<LoginResponse> {
  try {
    const response = await fetch(`${domain}/console/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
      body: JSON.stringify({
        email,
        password,
        language: 'zh-Hans',
        remember_me: rememberMe
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('登录请求失败:', error);
    return {
      result: 'error',
      message: '网络请求失败，请检查您的网络连接或域名设置'
    };
  }
}

// 获取用户信息
export async function fetchUserInfo(domain: string, token: string): Promise<UserInfo | null> {
  try {
    console.log(`正在从 ${domain}/console/api/account/profile 获取用户信息...`);
    const response = await fetch(`${domain}/console/api/account/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`获取用户信息失败: HTTP状态码 ${response.status}`);
      throw new Error(`获取用户信息失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('获取用户信息成功，响应数据:', data);
    return data || null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

// 获取存储的令牌
export function getTokens() {
  if (typeof window === 'undefined') return null;
  
  try {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!accessToken || !refreshToken) return null;
    
    return {
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('获取令牌失败:', error);
    return null;
  }
}

// 获取API域名
export function getApiDomain(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('api_domain') || '';
  } catch (error) {
    console.error('获取API域名失败:', error);
    return '';
  }
}

// 获取存储的用户信息
export function getUserInfo(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userInfoStr = localStorage.getItem('user_info');
    if (!userInfoStr) return null;
    
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('解析用户信息失败:', error);
    return null;
  }
}

// 保存认证信息
export function saveAuth(accessToken: string, refreshToken: string, domain: string) {
  if (typeof window === 'undefined') return;
  
  try {
    // 保存到 localStorage
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('api_domain', domain);
    
    // 同时保存到 cookie，设置过期时间为30天
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    document.cookie = `access_token=${accessToken}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `refresh_token=${refreshToken}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `api_domain=${domain}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error('保存认证信息失败:', error);
  }
}

// 保存用户信息
export function saveUserInfo(userInfo: UserInfo) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('user_info', JSON.stringify(userInfo));
  } catch (error) {
    console.error('保存用户信息失败:', error);
  }
}

// 清除认证信息
export function clearAuth() {
  if (typeof window === 'undefined') return;
  
  try {
    // 清除 localStorage，但保留 api_domain
    const savedDomain = localStorage.getItem('api_domain');
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    
    if (savedDomain) {
      localStorage.setItem('api_domain', savedDomain);
    }
    
    // 清除 cookie
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
  } catch (error) {
    console.error('清除认证信息失败:', error);
  }
}

// 检查是否已登录
export function isLoggedIn(): boolean {
  return !!getTokens();
}

// 刷新 token
export async function refreshToken(domain: string, refreshTokenStr: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${domain}/console/api/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshTokenStr
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('刷新 token 请求失败:', error);
    return {
      result: 'error',
      message: '网络请求失败，请检查您的网络连接'
    };
  }
}
