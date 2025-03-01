import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

// 这个函数可以是异步的，如果需要等待 Promise 完成
export function middleware(request: NextRequest) {
  // 获取 cookies 中的 token
  const accessToken = request.cookies.get("access_token")?.value;

  // 获取当前请求的路径
  const { pathname } = request.nextUrl;

  // 如果已登录且尝试访问登录页面，重定向到仪表盘
  if (pathname === "/signin" && accessToken) {
    const url = new URL("/dashboard", request.url);

    return NextResponse.redirect(url);
  }

  // 无需登录即可访问的路径列表
  const publicPaths = ["/", "/signin"];

  // 检查当前路径是否是公开路径
  const isPublicPath = publicPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith("/_next") ||
      pathname.includes("/api/"),
  );

  // 如果是公开路径，无论是否登录都允许访问
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 如果不是公开路径且未登录，重定向到登录页面
  if (!accessToken) {
    const url = new URL("/signin", request.url);

    return NextResponse.redirect(url);
  }

  // 对于其他情况，继续处理请求
  return NextResponse.next();
}

// 配置匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，但排除以下路径:
     * 1. 静态资源路径 (_next/static, _next/image, favicon.ico)
     * 2. API路由 (/api/*)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
