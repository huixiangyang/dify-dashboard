import { title } from "@/components/primitives";
import ApiExample from "@/components/api-example";

/**
 * API 文档页面
 * 展示 token 刷新机制和 API 请求示例
 */
export default function DocsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className={title({ size: "lg" })}>API 文档</h1>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Token 刷新机制</h2>
        <p className="mb-4">
          当 access token 过期时（服务器返回 401 状态码），系统会自动使用
          refresh token 向 <code>/console/api/refresh-token</code>{" "}
          端点发送请求，获取新的 token 对。
        </p>
        <p className="mb-4">
          刷新成功后，新的 token 会被保存，并且原始请求会使用新 token 自动重试。
        </p>
        <p className="mb-4">刷新 token 的响应格式如下：</p>
        <pre className="bg-gray-100 p-3 rounded overflow-auto mb-4">
          {`{
    "result": "success",
    "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "efbe9b048fca76b02fba42b9e3ba28cac955157e..."
    }
}`}
        </pre>
      </div>

      <div className="mt-8">
        <ApiExample endpoint="/console/api/account/profile" />
      </div>
    </div>
  );
}
