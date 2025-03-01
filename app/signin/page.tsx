'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Switch } from '@heroui/switch';
import { useRouter } from 'next/navigation';
import { login, saveAuth, getApiDomain, fetchUserInfo } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { SparklesIcon, RocketIcon } from '@/components/icons';

export default function SignIn() {
  const router = useRouter();
  const { setAuth, setUserData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [domain, setDomain] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 初始化域名
  useEffect(() => {
    const savedDomain = getApiDomain();
    if (savedDomain) {
      setDomain(savedDomain);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(email, password, domain, rememberMe);

      if (response.result === 'success' && response.data) {
        // 保存认证信息
        saveAuth(response.data.access_token, response.data.refresh_token, domain);
        
        // 设置认证状态
        setAuth(true);
        
        // 获取用户信息
        const userInfo = await fetchUserInfo(domain, response.data.access_token);
        if (userInfo) {
          setUserData(userInfo);
        }
        
        // 跳转到仪表盘页面
        router.push('/dashboard');
      } else {
        setError('登录失败：' + (response.message || '请检查您的凭据'));
      }
    } catch (err) {
      setError('登录请求失败，请检查网络连接或域名设置');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-content1/50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            登录到 Dify Dashboard
          </h1>
          <p className="mt-3 text-default-500">
            使用您独立部署的 Dify 服务登录
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm text-white bg-danger/90 rounded-xl shadow-lg animate-pulse">
            {error}
          </div>
        )}

        <div className="bg-content1 rounded-2xl shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="domain" className="block text-sm font-medium mb-2 flex items-center">
                  <RocketIcon className="w-4 h-4 mr-1 text-primary" />
                  API 域名
                </label>
                <Input
                  id="domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="请输入 API 域名"
                  className="w-full"
                  variant="bordered"
                  required
                />
                <p className="mt-1.5 text-xs text-default-400">
                  例如: https://dify.xxx.cn
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  电子邮箱
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入您的电子邮箱"
                  className="w-full"
                  variant="bordered"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  密码
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入您的密码"
                  className="w-full"
                  variant="bordered"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch 
                    isSelected={rememberMe}
                    onValueChange={setRememberMe}
                    aria-label="记住我"
                    color="secondary"
                  />
                  <span className="text-sm">记住我</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              color="primary"
              variant="shadow"
              isLoading={isLoading}
              disabled={isLoading}
              startContent={!isLoading && <SparklesIcon className="w-4 h-4" />}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </form>
        </div>
        
        <p className="text-center text-sm text-default-500 mt-6">
          Dify Dashboard - 简单、轻巧、快速的 Dify 应用管理控制台
        </p>
      </div>
    </div>
  );
}
