import { getApiDomain } from './auth';
import { get } from './http-client';

export interface StatisticsData {
  totalApps: number;
  chatApps: number;
  textGenApps: number;
  apiKeys: number;
}

/**
 * 获取总体统计数据
 * @returns 统计数据
 */
export async function fetchStatistics(): Promise<StatisticsData | null> {
  try {
    const domain = getApiDomain();
    
    if (!domain) {
      console.error('获取统计数据失败: 缺少域名');
      return null;
    }
    
    console.log(`正在从 ${domain}/api/v1/statistics 获取统计数据...`);
    
    // 使用 http-client 的 get 方法
    const data = await get<StatisticsData>('/api/v1/statistics');
    
    return data;
  } catch (error) {
    console.error('获取统计数据时发生错误:', error);
    return null;
  }
}

/**
 * 模拟获取统计数据（用于开发测试）
 * @returns 模拟的统计数据
 */
export function getMockStatistics(): StatisticsData {
  return {
    totalApps: 4,
    chatApps: 4,
    textGenApps: 0,
    apiKeys: 8
  };
}
