import { getApiDomain, getTokens } from "./auth";
import { get, post, del } from "./http-client";

export interface AppData {
  id: string;
  name: string;
  max_active_requests: number | null;
  description: string;
  mode: string;
  icon_type: string;
  icon: string;
  icon_background: string;
  icon_url: string | null;
  model_config: any;
  workflow: {
    id: string;
    created_by: string;
    created_at: number;
    updated_by: string | null;
    updated_at: number;
  };
  use_icon_as_answer_icon: boolean;
  created_by: string;
  created_at: number;
  updated_by: string;
  updated_at: number;
  tags: string[];
}

export interface AppsResponse {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
  data: AppData[];
}

export interface ApiKey {
  id: string;
  type: string;
  token: string;
  last_used_at: number | null;
  created_at: number;
}

export interface ApiKeysResponse {
  data: ApiKey[];
}

/**
 * 获取应用列表
 * @param page 页码
 * @param limit 每页数量
 * @param search 搜索关键词
 * @param includeDeleted 是否包含已删除的应用
 * @returns 应用列表
 */
export async function fetchApps(
  page: number = 1,
  limit: number = 30,
  search: string = "",
  includeDeleted: boolean = false,
): Promise<AppsResponse | null> {
  try {
    const domain = getApiDomain();

    if (!domain) {
      console.error("无法获取应用列表: 缺少域名");

      return null;
    }

    console.log(`正在从 ${domain}/console/api/apps 获取应用列表...`);

    // 构建查询参数
    const queryParams = new URLSearchParams();

    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    if (search) {
      queryParams.append("search", search);
    }
    
    if (includeDeleted) {
      queryParams.append("include_deleted", "true");
    }

    // 使用 http-client 的 get 方法
    const data = await get<AppsResponse>(
      `/console/api/apps?${queryParams.toString()}`,
    );

    console.log("获取应用列表成功，共获取到", data.data.length, "个应用");

    return data;
  } catch (error) {
    console.error("获取应用列表失败:", error);

    return null;
  }
}

/**
 * 获取应用 API 密钥
 * @param appId 应用 ID
 * @returns API 密钥列表
 */
export async function fetchAppApiKeys(
  appId: string,
): Promise<ApiKeysResponse | null> {
  try {
    const domain = getApiDomain();

    if (!domain) {
      console.error("无法获取应用 API 密钥: 缺少域名");

      return null;
    }

    console.log(
      `正在从 ${domain}/console/api/apps/${appId}/api-keys 获取 API 密钥...`,
    );

    // 使用 http-client 的 get 方法
    const data = await get<ApiKeysResponse>(
      `/console/api/apps/${appId}/api-keys`,
    );

    console.log("获取应用 API 密钥成功，共获取到", data.data.length, "个密钥");

    return data;
  } catch (error) {
    console.error("获取应用 API 密钥失败:", error);

    return null;
  }
}

/**
 * 创建应用 API 密钥
 * @param appId 应用 ID
 * @returns 新创建的 API 密钥
 */
export async function createAppApiKey(appId: string): Promise<ApiKey | null> {
  try {
    const domain = getApiDomain();

    if (!domain) {
      console.error("无法创建应用 API 密钥: 缺少域名");

      return null;
    }

    console.log(`正在为应用 ${appId} 创建新的 API 密钥...`);

    // 使用 http-client 的 post 方法，注意这里直接返回的是 ApiKey 对象
    const data = await post<ApiKey>(`/console/api/apps/${appId}/api-keys`, {});

    console.log("创建应用 API 密钥成功:", data.token);

    return data;
  } catch (error) {
    console.error("创建应用 API 密钥失败:", error);

    return null;
  }
}

/**
 * 删除应用 API 密钥
 * @param appId 应用 ID
 * @param keyId 密钥 ID
 * @returns 是否删除成功
 */
export async function deleteAppApiKey(
  appId: string,
  keyId: string,
): Promise<boolean> {
  try {
    const domain = getApiDomain();

    if (!domain) {
      console.error("无法删除应用 API 密钥: 缺少域名");

      return false;
    }

    console.log(`正在删除应用 ${appId} 的 API 密钥 ${keyId}...`);

    // 使用 http-client 的 del 方法
    await del(`/console/api/apps/${appId}/api-keys/${keyId}`);

    console.log("删除应用 API 密钥成功");

    return true;
  } catch (error) {
    console.error("删除应用 API 密钥失败:", error);

    return false;
  }
}

/**
 * 删除应用
 * @param appId 应用 ID
 * @returns 是否删除成功
 */
export async function deleteApp(appId: string): Promise<boolean> {
  try {
    await del(`/console/api/apps/${appId}`);

    return true;
  } catch (error) {
    console.error("删除应用失败:", error);

    return false;
  }
}

/**
 * 获取单个应用详情
 * @param appId 应用ID
 * @returns 应用详情
 */
export async function fetchAppDetail(appId: string): Promise<AppData | null> {
  try {
    const domain = getApiDomain();

    if (!domain) {
      console.error("无法获取应用详情: 缺少域名");

      return null;
    }

    const url = `/console/api/apps/${appId}`;
    const tokens = getTokens();

    if (!tokens) {
      console.error("无法获取应用详情: 缺少认证信息");

      return null;
    }

    // 使用 fetch 获取应用详情
    const response = await fetch(`${domain}${url}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `获取应用详情失败: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("获取应用详情失败:", error);

    return null;
  }
}

// 统计数据类型定义
export interface DailyData {
  date: string;
  value: number;
}

export interface StatisticsResponse {
  data: DailyData[];
}

export interface TokenCostsResponse {
  total_tokens: number;
  total_cost: number;
  prompt_tokens: number;
  prompt_cost: number;
  completion_tokens: number;
  completion_cost: number;
  data: {
    date: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_cost: number;
    completion_cost: number;
    total_cost: number;
  }[];
}

// 统计类型
export enum StatisticsType {
  CONVERSATIONS = "conversations",
  END_USERS = "end-users",
  MESSAGES = "messages",
  TOKENS = "tokens",
  COSTS = "costs",
  DAILY_CONVERSATIONS = "daily-conversations",
  DAILY_END_USERS = "daily-end-users",
  AVERAGE_SESSION_INTERACTIONS = "average-session-interactions",
  TOKENS_PER_SECOND = "tokens-per-second",
  USER_SATISFACTION_RATE = "user-satisfaction-rate",
  TOKEN_COSTS = "token-costs",
  DAILY_MESSAGES = "daily-messages",
}

/**
 * 获取应用统计信息
 * @param appId 应用ID
 * @param type 统计类型
 * @param start 开始时间 格式：YYYY-MM-DD HH:MM
 * @param end 结束时间 格式：YYYY-MM-DD HH:MM
 * @returns 统计数据
 */
export async function fetchAppStatistics(
  appId: string,
  type: StatisticsType,
  start: string,
  end: string,
): Promise<StatisticsResponse | TokenCostsResponse | null> {
  try {
    const domain = getApiDomain();

    if (!domain) {
      console.error("无法获取应用统计信息: 缺少域名");

      return null;
    }

    console.log(
      `正在从 ${domain}/console/api/apps/${appId}/statistics/${type} 获取统计信息...`,
    );

    // 构建查询参数
    const queryParams = new URLSearchParams();

    queryParams.append("start", start);
    queryParams.append("end", end);

    // 使用 http-client 的 get 方法
    const data = await get<StatisticsResponse | TokenCostsResponse>(
      `/console/api/apps/${appId}/statistics/${type}?${queryParams.toString()}`,
    );

    console.log("获取应用统计信息成功");

    return data;
  } catch (error) {
    console.error("获取应用统计信息失败:", error);

    return null;
  }
}

/**
 * 导出应用
 * @param appId 应用 ID
 * @param includeSecret 是否包含密钥
 * @returns 应用配置数据
 */
export async function exportApp(
  appId: string,
  includeSecret: boolean = false,
): Promise<{ data: string } | null> {
  try {
    const domain = getApiDomain();

    if (!domain) {
      console.error("无法导出应用: 缺少域名");

      return null;
    }

    const url = `/console/api/apps/${appId}/export?include_secret=${includeSecret}`;
    const tokens = getTokens();

    if (!tokens) {
      console.error("无法导出应用: 缺少认证信息");

      return null;
    }

    // 使用 fetch 获取 JSON 数据
    const response = await fetch(`${domain}${url}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`导出失败: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("导出应用失败:", error);

    return null;
  }
}

/**
 * 复制应用
 * @param appId 应用 ID
 * @param data 应用数据
 * @returns 新应用数据
 */
export async function copyApp(
  appId: string,
  data: {
    name: string;
    icon_type: string;
    icon: string;
    icon_background: string;
    mode: string;
  },
): Promise<AppData | null> {
  try {
    const domain = getApiDomain();

    if (!domain) {
      console.error("无法复制应用: 缺少域名");

      return null;
    }

    const url = `/console/api/apps/${appId}/copy`;
    const tokens = getTokens();

    if (!tokens) {
      console.error("无法复制应用: 缺少认证信息");

      return null;
    }

    // 使用 fetch 发送请求，手动处理 201 状态码
    const response = await fetch(`${domain}${url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    // 201 Created 也是成功状态码
    if (response.status === 201 || response.ok) {
      return await response.json();
    } else {
      throw new Error(`复制失败: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("复制应用失败:", error);

    return null;
  }
}

/**
 * 导出所有应用为压缩包
 */
export const exportAllApps = async (): Promise<Blob> => {
  try {
    // 使用现有的 API 函数，避免直接调用可能不存在的接口
    const appsResponse = await fetchApps();

    // 如果没有应用，返回空的 Blob
    if (!appsResponse || !appsResponse.data || appsResponse.data.length === 0) {
      return new Blob(["没有应用可导出"], { type: "text/plain" });
    }

    // 创建一个 JSZip 实例
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    // 为每个应用创建一个 YAML 文件
    const exportPromises = appsResponse.data.map(async (app) => {
      try {
        const appData = await exportApp(app.id);

        if (appData) {
          // exportApp 返回的是 { data: string }，需要提取 data 字段
          zip.file(`${app.name}.yaml`, appData.data);
        }
      } catch (error) {
        console.error(`导出应用 ${app.name} 失败:`, error);
      }
    });

    // 等待所有导出完成
    await Promise.all(exportPromises);

    // 生成 zip 文件
    return await zip.generateAsync({ type: "blob" });
  } catch (error) {
    console.error("导出所有应用失败:", error);
    throw error;
  }
};
