'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { useAuth } from '@/contexts/AuthContext';
import { login, getApiDomain, saveAuth } from '@/services/auth';
import { SparklesIcon } from '@/components/icons';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [domain, setDomain] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setAuth } = useAuth();

  // 初始化域名
  useEffect(() => {
    // 确保在客户端执行
    const initDomain = () => {
      const savedDomain = getApiDomain();
      if (savedDomain) {
        setDomain(savedDomain);
        console.log('使用保存的域名:', savedDomain);
      }
    };
    
    initDomain();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || !domain) {
      setError('请填写所有必填字段');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await login(email, password, domain, rememberMe);
      
      if (response.result === 'success' && response.data) {
        const { access_token, refresh_token } = response.data;
        saveAuth(access_token, refresh_token, domain);
        setAuth(true);
        router.push('/dashboard');
      } else {
        setError(response.message || '登录失败，请检查您的凭据');
      }
    } catch (error) {
      console.error('登录过程中发生错误:', error);
      setError('登录过程中发生错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Dify Dashboard</h1>
          </div>
          <p className="text-center text-default-500">登录您的账户以访问仪表板</p>
        </CardHeader>
        
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-default-700">
                API 域名 <span className="text-danger">*</span>
              </label>
              <Input
                id="domain"
                type="text"
                placeholder="https://api.example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="mt-1 w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-default-700">
                邮箱 <span className="text-danger">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-default-700">
                密码 <span className="text-danger">*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full"
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-default-600">
                记住我
              </label>
            </div>
            
            {error && (
              <div className="rounded-md bg-danger-50 p-3 text-sm text-danger-700">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isLoading}
              loadingText="登录中..."
            >
              登录
            </Button>
          </form>
        </CardBody>
        
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-default-500">
            首次使用? 请联系您的系统管理员获取访问权限
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
