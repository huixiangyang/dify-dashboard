'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Progress } from "@heroui/progress";
import { fetchStatistics, StatisticsData, getMockStatistics } from '@/services/statistics';

export default function DashboardStatistics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);

  useEffect(() => {
    const loadStatistics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 在实际环境中使用 fetchStatistics()
        // 在开发环境中使用模拟数据
        const data = getMockStatistics(); // 替换为 await fetchStatistics();
        
        if (data) {
          setStatistics(data);
        } else {
          setError('获取统计数据失败');
        }
      } catch (err) {
        setError('获取统计数据时发生错误');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="w-full h-24 bg-content1 animate-pulse">
            <CardBody className="flex items-center justify-center">
              <div className="h-4 w-3/4 bg-default-200 rounded"></div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 text-danger p-4 rounded-lg mb-6">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="w-full bg-content1">
        <CardBody className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-default-500 text-sm">应用总数</span>
            <span className="text-2xl font-bold text-primary">{statistics?.totalApps || 0}</span>
          </div>
          <Divider className="my-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-default-400">总计</span>
            <span className="text-xs text-default-600">{statistics?.totalApps || 0} 个应用</span>
          </div>
        </CardBody>
      </Card>

      <Card className="w-full bg-content1">
        <CardBody className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-default-500 text-sm">对话型应用</span>
            <span className="text-2xl font-bold text-secondary">{statistics?.chatApps || 0}</span>
          </div>
          <Divider className="my-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-default-400">占比</span>
            <Progress 
              value={statistics?.totalApps ? (statistics.chatApps / statistics.totalApps) * 100 : 0} 
              className="max-w-md"
              color="secondary"
              size="sm"
            />
            <span className="text-xs text-default-600">
              {statistics?.totalApps ? Math.round((statistics.chatApps / statistics.totalApps) * 100) : 0}%
            </span>
          </div>
        </CardBody>
      </Card>

      <Card className="w-full bg-content1">
        <CardBody className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-default-500 text-sm">文本生成型应用</span>
            <span className="text-2xl font-bold text-success">{statistics?.textGenApps || 0}</span>
          </div>
          <Divider className="my-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-default-400">占比</span>
            <Progress 
              value={statistics?.totalApps ? (statistics.textGenApps / statistics.totalApps) * 100 : 0} 
              className="max-w-md"
              color="success"
              size="sm"
            />
            <span className="text-xs text-default-600">
              {statistics?.totalApps ? Math.round((statistics.textGenApps / statistics.totalApps) * 100) : 0}%
            </span>
          </div>
        </CardBody>
      </Card>

      <Card className="w-full bg-content1">
        <CardBody className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-default-500 text-sm">API Keys</span>
            <span className="text-2xl font-bold text-warning">{statistics?.apiKeys || 0}</span>
          </div>
          <Divider className="my-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-default-400">平均每应用</span>
            <span className="text-xs text-default-600">
              {statistics?.totalApps && statistics?.apiKeys 
                ? (statistics.apiKeys / statistics.totalApps).toFixed(1) 
                : 0} 个
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
