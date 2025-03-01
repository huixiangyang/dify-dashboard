// API 服务
import { getTokens, saveAuth, getApiDomain } from './auth';
import { get as httpGet, post as httpPost, put as httpPut, del as httpDel } from './http-client';

// API 响应接口
export interface ApiResponse<T = any> {
  result: string;
  data?: T;
  message?: string;
}

/**
 * 发送 GET 请求
 * @param endpoint API 端点
 * @param options 请求选项
 * @returns 响应数据
 */
export async function get<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return httpGet<T>(endpoint, options);
}

/**
 * 发送 POST 请求
 * @param endpoint API 端点
 * @param data 请求数据
 * @param options 请求选项
 * @returns 响应数据
 */
export async function post<T = any>(
  endpoint: string,
  data: any,
  options: RequestInit = {}
): Promise<T> {
  return httpPost<T>(endpoint, data, options);
}

/**
 * 发送 PUT 请求
 * @param endpoint API 端点
 * @param data 请求数据
 * @param options 请求选项
 * @returns 响应数据
 */
export async function put<T = any>(
  endpoint: string,
  data: any,
  options: RequestInit = {}
): Promise<T> {
  return httpPut<T>(endpoint, data, options);
}

/**
 * 发送 DELETE 请求
 * @param endpoint API 端点
 * @param options 请求选项
 * @returns 响应数据
 */
export async function del<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return httpDel<T>(endpoint, options);
}
