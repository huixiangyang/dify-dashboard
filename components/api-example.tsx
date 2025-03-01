'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { get, post } from '@/services/api';

interface ApiExampleProps {
  endpoint?: string; // 可选的自定义端点
}

/**
 * API 请求示例组件
 * 展示如何使用 API 服务和 token 刷新功能
 */
export default function ApiExample({ endpoint = '/console/api/some-endpoint' }: ApiExampleProps) {
  const { isAuthenticated, refreshAuthToken } = useAuth();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 发送测试请求
   */
  const handleTestRequest = async () => {
    if (!isAuthenticated) {
      setResult('请先登录');
      return;
    }

    setLoading(true);
    setResult('正在发送请求...');

    try {
      // 发送 API 请求
      // 注意：这里使用了我们创建的 API 服务，它会自动处理 token 刷新
      const response = await get(endpoint);
      
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('请求失败:', error);
      setResult(`请求失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 手动刷新 token
   */
  const handleManualRefresh = async () => {
    setLoading(true);
    setResult('正在手动刷新 token...');

    try {
      const success = await refreshAuthToken();
      if (success) {
        setResult('Token 刷新成功');
      } else {
        setResult('Token 刷新失败');
      }
    } catch (error) {
      console.error('刷新 token 失败:', error);
      setResult(`刷新 token 失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">API 请求示例</h2>
      
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleTestRequest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          发送测试请求
        </button>
        
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          手动刷新 Token
        </button>
      </div>
      
      {loading && <div className="text-gray-500">加载中...</div>}
      
      {result && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">结果:</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
