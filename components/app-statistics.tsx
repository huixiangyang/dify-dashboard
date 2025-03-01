'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { fetchAppStatistics, StatisticsType, DailyData, TokenCostsResponse, StatisticsResponse } from '@/services/apps';

// 颜色配置
const colors = {
  primary: '#0070F3',
  secondary: '#7928CA',
  success: '#17C964',
  warning: '#F5A524',
  danger: '#F31260',
  info: '#06B6D4',
  light: '#F4F4F5',
  dark: '#18181B',
};

// 图表类型
type ChartType = 'line' | 'bar' | 'pie';

interface AppStatisticsProps {
  appId: string;
  days?: number; // 默认显示最近7天
}

export default function AppStatistics({ appId, days = 7 }: AppStatisticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 统计数据
  const [conversations, setConversations] = useState<DailyData[]>([]);
  const [endUsers, setEndUsers] = useState<DailyData[]>([]);
  const [avgInteractions, setAvgInteractions] = useState<DailyData[]>([]);
  const [tokensPerSecond, setTokensPerSecond] = useState<DailyData[]>([]);
  const [satisfactionRate, setSatisfactionRate] = useState<DailyData[]>([]);
  const [tokenCosts, setTokenCosts] = useState<TokenCostsResponse | null>(null);
  const [messages, setMessages] = useState<DailyData[]>([]);

  useEffect(() => {
    const loadStatistics = async () => {
      if (!appId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // 计算日期范围
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        
        // 格式化日期
        const formatDate = (date: Date) => {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} 00:00`;
        };
        
        const endFormatted = formatDate(new Date(end.setHours(23, 59, 59)));
        const startFormatted = formatDate(start);
        
        // 并行获取所有统计数据
        const [
          conversationsRes,
          endUsersRes,
          avgInteractionsRes,
          tokensPerSecondRes,
          satisfactionRateRes,
          tokenCostsRes,
          messagesRes
        ] = await Promise.all([
          fetchAppStatistics(appId, 'daily-conversations', startFormatted, endFormatted),
          fetchAppStatistics(appId, 'daily-end-users', startFormatted, endFormatted),
          fetchAppStatistics(appId, 'average-session-interactions', startFormatted, endFormatted),
          fetchAppStatistics(appId, 'tokens-per-second', startFormatted, endFormatted),
          fetchAppStatistics(appId, 'user-satisfaction-rate', startFormatted, endFormatted),
          fetchAppStatistics(appId, 'token-costs', startFormatted, endFormatted),
          fetchAppStatistics(appId, 'daily-messages', startFormatted, endFormatted)
        ]);
        
        // 设置数据
        if (conversationsRes) setConversations((conversationsRes as StatisticsResponse).data);
        if (endUsersRes) setEndUsers((endUsersRes as StatisticsResponse).data);
        if (avgInteractionsRes) setAvgInteractions((avgInteractionsRes as StatisticsResponse).data);
        if (tokensPerSecondRes) setTokensPerSecond((tokensPerSecondRes as StatisticsResponse).data);
        if (satisfactionRateRes) setSatisfactionRate((satisfactionRateRes as StatisticsResponse).data);
        if (tokenCostsRes) setTokenCosts(tokenCostsRes as TokenCostsResponse);
        if (messagesRes) setMessages((messagesRes as StatisticsResponse).data);
        
      } catch (err) {
        console.error('加载统计数据失败:', err);
        setError('获取统计数据时发生错误');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStatistics();
  }, [appId, days]);

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 渲染图表
  const renderChart = (
    title: string, 
    data: DailyData[], 
    type: ChartType = 'line', 
    color: string = colors.primary,
    valueFormatter?: (value: number) => string
  ) => {
    // 如果数据为空，显示空状态
    if (!data || data.length === 0) {
      return (
        <div className="bg-content1 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <div className="h-[200px] flex items-center justify-center bg-default-50 rounded">
            <p className="text-default-500">暂无数据</p>
          </div>
        </div>
      );
    }

    // 处理数据，添加格式化的日期
    const chartData = data.map(item => ({
      ...item,
      formattedDate: formatDate(item.date)
    }));

    // 根据图表类型渲染不同的图表
    let chart;
    switch (type) {
      case 'line':
        chart = (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="formattedDate" />
              <YAxis 
                tickFormatter={valueFormatter}
                width={40}
              />
              <Tooltip 
                formatter={(value: number) => [valueFormatter ? valueFormatter(value) : value, '']}
                labelFormatter={(label) => `日期: ${label}`}
              />
              <Line type="monotone" dataKey="value" stroke={color} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
        break;
        
      case 'bar':
        chart = (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="formattedDate" />
              <YAxis 
                tickFormatter={valueFormatter}
                width={40}
              />
              <Tooltip 
                formatter={(value: number) => [valueFormatter ? valueFormatter(value) : value, '']}
                labelFormatter={(label) => `日期: ${label}`}
              />
              <Bar dataKey="value" fill={color} />
            </BarChart>
          </ResponsiveContainer>
        );
        break;
        
      case 'pie':
        chart = (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill={color}
                dataKey="value"
                nameKey="formattedDate"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[Object.keys(colors)[index % Object.keys(colors).length] as keyof typeof colors]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [valueFormatter ? valueFormatter(value) : value, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        );
        break;
    }

    return (
      <div className="bg-content1 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        {chart}
      </div>
    );
  };

  // 渲染 Token 成本卡片
  const renderTokenCosts = () => {
    if (!tokenCosts) {
      return (
        <div className="bg-content1 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Token 成本</h3>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="bg-default-50 p-3 rounded text-center">
              <p className="text-xs text-default-500">总 Token</p>
              <p className="font-medium">0</p>
            </div>
            <div className="bg-default-50 p-3 rounded text-center">
              <p className="text-xs text-default-500">总成本</p>
              <p className="font-medium">$0.0000</p>
            </div>
            <div className="bg-default-50 p-3 rounded text-center">
              <p className="text-xs text-default-500">平均成本/1K Token</p>
              <p className="font-medium">$0.0000</p>
            </div>
          </div>
        </div>
      );
    }

    // 处理数据，添加格式化的日期
    const chartData = tokenCosts.data?.map(item => ({
      ...item,
      formattedDate: formatDate(item.date)
    })) || [];

    return (
      <div className="bg-content1 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-2">Token 成本</h3>
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="bg-default-50 p-3 rounded text-center">
            <p className="text-xs text-default-500">总 Token</p>
            <p className="font-medium">{tokenCosts.total_tokens?.toLocaleString() || '0'}</p>
          </div>
          <div className="bg-default-50 p-3 rounded text-center">
            <p className="text-xs text-default-500">总成本</p>
            <p className="font-medium">${tokenCosts.total_cost?.toFixed(4) || '0.0000'}</p>
          </div>
          <div className="bg-default-50 p-3 rounded text-center">
            <p className="text-xs text-default-500">平均成本/1K Token</p>
            <p className="font-medium">
              ${tokenCosts.total_tokens > 0 
                ? (tokenCosts.total_cost / (tokenCosts.total_tokens / 1000)).toFixed(4) 
                : '0.0000'}
            </p>
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="formattedDate" />
              <YAxis yAxisId="left" orientation="left" stroke={colors.primary} />
              <YAxis yAxisId="right" orientation="right" stroke={colors.secondary} />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="prompt_tokens" 
                name="提示 Tokens" 
                stroke={colors.primary}
                activeDot={{ r: 8 }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="completion_tokens" 
                name="补全 Tokens" 
                stroke={colors.secondary} 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="total_cost" 
                name="总成本 ($)" 
                stroke={colors.success} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center bg-default-50 rounded">
            <p className="text-default-500">暂无数据</p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="my-6">
        <div className="flex justify-center items-center h-[300px]">
          <p>加载统计数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6">
        <div className="bg-danger-50 text-danger p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">应用统计信息</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {renderChart('每日对话数', conversations, 'bar', colors.primary)}
        {renderChart('每日用户数', endUsers, 'bar', colors.secondary)}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {renderChart('平均会话交互次数', avgInteractions, 'line', colors.success)}
        {renderChart('每秒 Token 数', tokensPerSecond, 'line', colors.info)}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {renderChart('用户满意度', satisfactionRate, 'line', colors.warning, 
          (value) => `${(value * 100).toFixed(0)}%`)}
        {renderChart('每日消息数', messages, 'bar', colors.danger)}
      </div>
      
      <div className="mb-6">
        {renderTokenCosts()}
      </div>
    </div>
  );
}
