'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApps, AppData } from '@/services/apps';
import { getEmojiFromName } from '@/utils/emoji';
import DashboardStatistics from '@/components/dashboard-statistics';

export default function DashboardPage() {
  const { userInfo } = useAuth();
  const router = useRouter();
  const [recentApps, setRecentApps] = useState<AppData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentApps = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetchApps(1, 5, '', false);
        
        if (response) {
          setRecentApps(response.data);
        } else {
          setError('获取最近应用失败');
        }
      } catch (err) {
        setError('获取最近应用时发生错误');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentApps();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">欢迎回来，{userInfo?.name || '用户'}</h1>
        <p className="text-default-500">这是您的个人仪表盘，可以查看应用概览和快速访问常用功能。</p>
      </div>
      
      {/* 统计信息 */}
      <DashboardStatistics />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-content1 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">快速访问</h2>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/apps')}
              className="w-full flex items-center gap-3 p-3 bg-default-100 rounded-lg hover:bg-default-200 transition-colors"
            >
              <span className="text-xl">📱</span>
              <span>查看所有应用</span>
            </button>
            <button 
              onClick={() => router.push('/profile')}
              className="w-full flex items-center gap-3 p-3 bg-default-100 rounded-lg hover:bg-default-200 transition-colors"
            >
              <span className="text-xl">👤</span>
              <span>个人资料</span>
            </button>
            <button 
              onClick={() => router.push('/api-keys')}
              className="w-full flex items-center gap-3 p-3 bg-default-100 rounded-lg hover:bg-default-200 transition-colors"
            >
              <span className="text-xl">🔑</span>
              <span>API 密钥管理</span>
            </button>
          </div>
        </div>
        
        <div className="bg-content1 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">账户信息</h2>
          {userInfo ? (
            <div className="space-y-2">
              <div>
                <span className="text-default-500">用户名: </span>
                <span>{userInfo.name}</span>
              </div>
              <div>
                <span className="text-default-500">邮箱: </span>
                <span>{userInfo.email}</span>
              </div>
              <div>
                <span className="text-default-500">角色: </span>
                <span>{userInfo.role || '普通用户'}</span>
              </div>
              <div>
                <span className="text-default-500">上次登录: </span>
                <span>{userInfo.last_login_at ? new Date(userInfo.last_login_at * 1000).toLocaleString() : '未知'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-default-100 p-4 rounded-lg text-center">
              <p>加载用户信息中...</p>
            </div>
          )}
        </div>
        
        <div className="bg-content1 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">系统状态</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
              <span>系统状态</span>
              <span className="px-2 py-1 bg-success-100 text-success-600 rounded-full text-xs">正常</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
              <span>API 状态</span>
              <span className="px-2 py-1 bg-success-100 text-success-600 rounded-full text-xs">正常</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
              <span>当前时间</span>
              <span className="text-xs">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">最近应用</h2>
          <button 
            onClick={() => router.push('/apps')}
            className="text-primary hover:underline text-sm"
          >
            查看全部
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p>加载应用中...</p>
          </div>
        ) : error ? (
          <div className="bg-danger-50 text-danger p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        ) : recentApps.length === 0 ? (
          <div className="bg-default-100 p-6 rounded-lg text-center">
            <p>暂无应用</p>
            <button 
              onClick={() => router.push('/apps')}
              className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              浏览应用
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentApps.map(app => (
              <div 
                key={app.id} 
                className="bg-content1 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/apps/${app.id}`)}
              >
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: app.icon_background }}
                    >
                      {app.icon_type === 'emoji' ? getEmojiFromName(app.icon) : '🤖'}
                    </div>
                    <div>
                      <h3 className="font-medium">{app.name}</h3>
                      <p className="text-xs text-default-500">
                        创建于 {new Date(app.created_at * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-default-700 mb-3 line-clamp-2">
                    {app.description || '无描述'}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs px-2 py-1 bg-default-100 rounded-full">
                      {app.mode === 'advanced-chat' ? '高级对话' : app.mode}
                    </span>
                    <span className="text-xs text-default-500">
                      ID: {app.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-content1 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">快速指南</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-default-50 rounded-lg">
              <h3 className="font-medium mb-2">创建应用</h3>
              <p className="text-sm text-default-700 mb-3">
                通过访问应用页面，您可以创建新的应用并配置其参数。
              </p>
              <button 
                onClick={() => router.push('/apps')}
                className="text-primary hover:underline text-sm"
              >
                前往应用页面
              </button>
            </div>
            
            <div className="p-4 bg-default-50 rounded-lg">
              <h3 className="font-medium mb-2">查看统计信息</h3>
              <p className="text-sm text-default-700 mb-3">
                每个应用都有详细的统计信息，包括使用量、成本等数据。
              </p>
              <button 
                onClick={() => recentApps.length > 0 ? router.push(`/apps/${recentApps[0].id}`) : router.push('/apps')}
                className="text-primary hover:underline text-sm"
              >
                查看应用详情
              </button>
            </div>
            
            <div className="p-4 bg-default-50 rounded-lg">
              <h3 className="font-medium mb-2">管理个人资料</h3>
              <p className="text-sm text-default-700 mb-3">
                您可以在个人资料页面更新您的信息和偏好设置。
              </p>
              <button 
                onClick={() => router.push('/profile')}
                className="text-primary hover:underline text-sm"
              >
                前往个人资料
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
