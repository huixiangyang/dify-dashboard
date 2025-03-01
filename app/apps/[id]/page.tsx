'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchAppDetail, fetchAppApiKeys, AppData, ApiKey } from '@/services/apps';
import { getEmojiFromName } from '@/utils/emoji';
import AppStatistics from '@/components/app-statistics';

export default function AppDetailPage() {
  const params = useParams();
  // 确保从URL中获取正确的ID，并清理可能的额外字符
  const id = params?.id ? String(params.id): null;
  const router = useRouter();
  const [app, setApp] = useState<AppData | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadAppDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!id) {
          setError('应用ID不存在或格式不正确');
          router.push('/apps');
          return;
        }

        // 获取应用详情
        const appDetail = await fetchAppDetail(id);
        
        if (appDetail) {
          setApp(appDetail);
          
          // 获取应用的 API 密钥
          const apiKeysResponse = await fetchAppApiKeys(id);
          
          if (apiKeysResponse) {
            setApiKeys(apiKeysResponse.data);
            
            // 初始化 showToken 状态
            const initialShowToken: Record<string, boolean> = {};
            apiKeysResponse.data.forEach(key => {
              initialShowToken[key.id] = false;
            });
            setShowToken(initialShowToken);
          }
        } else {
          setError('获取应用信息失败');
          router.push('/apps');
        }
      } catch (err) {
        setError('加载应用详情时发生错误');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppDetails();
  }, [id, router]);

  const toggleShowToken = (keyId: string) => {
    setShowToken(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[300px]">
          <p>加载应用详情中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-danger-50 text-danger p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-default-100 p-6 rounded-lg text-center">
          <p>应用不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <button 
          onClick={() => router.push('/apps')}
          className="text-primary hover:underline flex items-center gap-1"
        >
          <span>←</span> 返回应用列表
        </button>
      </div>
      
      <div className="bg-content1 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: app.icon_background }}
            >
              {app.icon_type === 'emoji' ? getEmojiFromName(app.icon) : '🤖'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{app.name}</h1>
              <p className="text-default-500">
                创建于 {new Date(app.created_at * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">应用信息</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-default-500">ID: </span>
                  <span>{app.id}</span>
                </div>
                <div>
                  <span className="text-default-500">描述: </span>
                  <span>{app.description || '无描述'}</span>
                </div>
                <div>
                  <span className="text-default-500">模式: </span>
                  <span>{app.mode === 'advanced-chat' ? '高级对话' : app.mode}</span>
                </div>
                <div>
                  <span className="text-default-500">创建者: </span>
                  <span>{app.created_by}</span>
                </div>
                <div>
                  <span className="text-default-500">更新时间: </span>
                  <span>{new Date(app.updated_at * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">工作流信息</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-default-500">工作流 ID: </span>
                  <span>{app.workflow?.id}</span>
                </div>
                <div>
                  <span className="text-default-500">创建者: </span>
                  <span>{app.workflow?.created_by}</span>
                </div>
                <div>
                  <span className="text-default-500">创建时间: </span>
                  <span>{new Date(app.workflow?.created_at * 1000).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-default-500">更新时间: </span>
                  <span>{new Date(app.workflow?.updated_at * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-content1 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">API 密钥</h2>
          
          {apiKeys.length === 0 ? (
            <div className="bg-default-100 p-4 rounded-lg text-center">
              <p>暂无 API 密钥</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map(key => (
                <div key={key.id} className="border border-default-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{key.type === 'app' ? '应用密钥' : '密钥'}</h3>
                      <p className="text-xs text-default-500">
                        创建于 {new Date(key.created_at * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleShowToken(key.id)}
                        className="text-xs px-2 py-1 bg-default-100 rounded-md hover:bg-default-200"
                      >
                        {showToken[key.id] ? '隐藏' : '显示'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.token)}
                        className="text-xs px-2 py-1 bg-primary text-white rounded-md hover:bg-primary-600"
                      >
                        复制
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-default-50 p-3 rounded-md font-mono text-sm break-all">
                    {showToken[key.id] ? key.token : '••••••••••••••••••••••••••'}
                  </div>
                  
                  <div className="mt-3 text-xs text-default-500">
                    <span>上次使用: </span>
                    <span>{key.last_used_at ? new Date(key.last_used_at * 1000).toLocaleString() : '从未使用'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-content1 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <AppStatistics appId={id as string} days={7} />
        </div>
      </div>
    </div>
  );
}
