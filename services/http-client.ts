// HTTP 客户端服务
import { getTokens, saveAuth, getApiDomain, refreshToken } from "./auth";

// 刷新 token 的锁，防止多次并发刷新请求
let isRefreshing = false;
// 等待 token 刷新的请求队列
let refreshQueue: Array<(token: string) => void> = [];

/**
 * 创建请求头
 * @param options 请求选项
 * @param requireAuth 是否需要认证
 * @returns 请求头对象
 */
export function createHeaders(
  options: RequestInit = {},
  requireAuth: boolean = true,
): HeadersInit {
  // 创建基本请求头
  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
    ...(options.headers || {}),
  } as Record<string, string>;

  if (requireAuth) {
    const tokens = getTokens();

    if (tokens) {
      headers["Authorization"] = `Bearer ${tokens.accessToken}`;
    }
  }

  return headers;
}

/**
 * 刷新 access token 并等待结果
 * @returns 新的 access token 或 null
 */
export async function refreshTokenAndWait(): Promise<string | null> {
  const tokens = getTokens();
  const domain = getApiDomain();

  if (!tokens || !tokens.refreshToken) {
    console.error("无法刷新 token: 缺少 refresh token");

    return null;
  }

  // 如果已经在刷新中，则加入等待队列
  if (isRefreshing) {
    return new Promise<string | null>((resolve) => {
      refreshQueue.push((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    console.log("开始刷新 token...");
    const response = await refreshToken(domain, tokens.refreshToken);

    if (response.result === "success" && response.data) {
      const { access_token, refresh_token } = response.data;

      // 保存新的 token
      saveAuth(access_token, refresh_token, domain);

      // 执行队列中的请求
      refreshQueue.forEach((callback) => callback(access_token));
      refreshQueue = [];

      console.log("token 刷新成功");

      return access_token;
    } else {
      console.error("刷新 token 失败:", response.message);

      return null;
    }
  } catch (error) {
    console.error("刷新 token 请求失败:", error);

    return null;
  } finally {
    isRefreshing = false;
  }
}

/**
 * 发送 HTTP 请求并处理 token 刷新
 * @param url 请求 URL
 * @param options 请求选项
 * @param requireAuth 是否需要认证
 * @returns 响应数据
 */
export async function fetchWithTokenRefresh<T = any>(
  url: string,
  options: RequestInit = {},
  requireAuth: boolean = true,
): Promise<T> {
  const domain = getApiDomain();
  const fullUrl = url.startsWith("http") ? url : `${domain}${url}`;

  // 确保请求头包含认证信息
  const headers = createHeaders(options, requireAuth) as Record<string, string>;

  try {
    // 发送请求
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // 处理 401 未授权错误（token 过期）
    if (response.status === 401 && requireAuth) {
      console.log("Token 已过期，尝试刷新...");

      // 尝试刷新 token
      const newToken = await refreshTokenAndWait();

      if (newToken) {
        // 使用新 token 更新请求头
        headers["Authorization"] = `Bearer ${newToken}`;

        // 使用新 token 重试请求
        const retryResponse = await fetch(fullUrl, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          throw new Error(`请求失败: ${retryResponse.status}`);
        }

        // 检查响应内容类型和长度
        const contentType = retryResponse.headers.get("content-type");
        const contentLength = retryResponse.headers.get("content-length");

        // 如果是空响应或非JSON响应，则返回空对象
        if (
          contentLength === "0" ||
          !contentType ||
          !contentType.includes("application/json")
        ) {
          return {} as T;
        }

        return await retryResponse.json();
      } else {
        throw new Error("刷新 token 失败");
      }
    }

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    // 检查响应内容类型和长度
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    // 如果是空响应或非JSON响应，则返回空对象
    if (
      contentLength === "0" ||
      !contentType ||
      !contentType.includes("application/json")
    ) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error("请求失败:", error);
    throw error;
  }
}

/**
 * 发送 GET 请求
 * @param url 请求 URL
 * @param options 请求选项
 * @returns 响应数据
 */
export async function get<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  return fetchWithTokenRefresh<T>(url, {
    method: "GET",
    ...options,
  });
}

/**
 * 发送 POST 请求
 * @param url 请求 URL
 * @param data 请求数据
 * @param options 请求选项
 * @returns 响应数据
 */
export async function post<T = any>(
  url: string,
  data: any,
  options: RequestInit = {},
): Promise<T> {
  return fetchWithTokenRefresh<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * 发送 PUT 请求
 * @param url 请求 URL
 * @param data 请求数据
 * @param options 请求选项
 * @returns 响应数据
 */
export async function put<T = any>(
  url: string,
  data: any,
  options: RequestInit = {},
): Promise<T> {
  return fetchWithTokenRefresh<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * 发送 DELETE 请求
 * @param url 请求 URL
 * @param options 请求选项
 * @returns 响应数据
 */
export async function del<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  return fetchWithTokenRefresh<T>(url, {
    method: "DELETE",
    ...options,
  });
}
