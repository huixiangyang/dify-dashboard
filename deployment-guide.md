# Dify Dashboard 部署指南

本文档提供了将 Dify Dashboard 项目打包并部署到不同环境的详细步骤。

## 目录

1. [前期准备](#前期准备)
2. [构建项目](#构建项目)
3. [部署选项](#部署选项)
   - [Vercel 部署](#vercel-部署)
   - [Cloudflare Pages 部署](#cloudflare-pages-部署)
   - [Docker 部署](#docker-部署)
   - [传统服务器部署](#传统服务器部署)
4. [环境变量配置](#环境变量配置)
5. [常见问题解答](#常见问题解答)

## 前期准备

在部署之前，请确保：

1. 项目代码已经完成并通过测试
2. 已经安装了 Node.js (v18+) 和 pnpm
3. 所有依赖项都已正确安装
4. `.env.local` 文件中配置了正确的 API 地址

## 构建项目

### 1. 安装依赖

```bash
# 确保使用最新的依赖
pnpm install
```

### 2. 构建生产版本

```bash
# 构建优化后的生产版本
pnpm build
```

成功构建后，将在 `.next` 目录中生成生产版本的文件。

## 部署选项

### Vercel 部署

Vercel 是部署 Next.js 应用的最佳平台之一，提供了无缝集成和自动部署功能。

#### 步骤：

1. **创建 Vercel 账户**：访问 [vercel.com](https://vercel.com) 并注册账户

2. **安装 Vercel CLI**（可选）：
   ```bash
   npm install -g vercel
   ```

3. **登录 Vercel**（如果使用 CLI）：
   ```bash
   vercel login
   ```

4. **部署项目**：

   **方法 1：使用 Vercel 仪表板**
   - 在 Vercel 仪表板中点击 "New Project"
   - 导入您的 GitHub/GitLab/Bitbucket 仓库
   - 配置项目设置，包括环境变量
   - 点击 "Deploy"

   **方法 2：使用 Vercel CLI**
   ```bash
   # 在项目根目录运行
   vercel
   ```

5. **配置环境变量**：
   - 在 Vercel 项目设置中，添加 `NEXT_PUBLIC_API_BASE_URL` 环境变量
   - 设置其他必要的环境变量

### Cloudflare Pages 部署

Cloudflare Pages 是一个快速、可靠且易于使用的静态网站托管平台，也支持 Next.js 应用部署。

#### 步骤：

1. **创建 Cloudflare 账户**：访问 [dash.cloudflare.com](https://dash.cloudflare.com) 并注册账户

2. **配置项目**：

   在项目根目录创建 `_routes.json` 文件，确保 Next.js 的路由正常工作：
   ```json
   {
     "version": 1,
     "include": ["/*"],
     "exclude": []
   }
   ```

3. **部署到 Cloudflare Pages**：

   **方法 1：使用 Cloudflare Adapter**
   
   为了避免 Edge Runtime 错误，可以使用 Cloudflare 的官方 Adapter：
   
   ```bash
   # 安装 Cloudflare Adapter
   pnpm add @cloudflare/next-on-pages
   ```
   
   然后在 `package.json` 中添加构建脚本：
   
   ```json
   "scripts": {
     "pages:build": "npx @cloudflare/next-on-pages",
     "pages:deploy": "npx wrangler pages deploy .vercel/output/static",
     "pages:watch": "npx @cloudflare/next-on-pages --watch",
     "pages:dev": "npx wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat"
   }
   ```
   
   使用以下命令构建和部署：
   
   ```bash
   # 构建
   pnpm pages:build
   
   # 部署
   pnpm pages:deploy
   ```
   
   这种方法不需要修改任何代码或添加 Edge Runtime 配置。

   **方法 2：通过 Cloudflare 仪表板**
   - 登录 Cloudflare 仪表板
   - 导航到 "Pages"
   - 点击 "创建应用程序"
   - 选择 "连接到 Git"
   - 授权并选择您的 GitHub/GitLab 仓库
   - 配置构建设置：
     - 构建命令：`npx @cloudflare/next-on-pages`
     - 构建输出目录：`.vercel/output/static`
     - 安装命令：`pnpm install`
     - 构建系统版本：选择最新版本
   - 在 "环境变量" 部分添加 `NEXT_PUBLIC_API_BASE_URL`
   - 点击 "保存并部署"

   **方法 3：使用 Wrangler CLI**
   ```bash
   # 安装 Wrangler CLI
   npm install -g wrangler
   
   # 登录到 Cloudflare
   wrangler login
   
   # 构建项目（使用 Cloudflare Adapter）
   pnpm pages:build
   
   # 部署到 Cloudflare Pages
   wrangler pages deploy .vercel/output/static --project-name=dify-dashboard
   ```

4. **配置自定义域名**（可选）：
   - 在 Cloudflare Pages 项目设置中，导航到 "自定义域"
   - 点击 "设置自定义域"
   - 输入您的域名并按照指示完成配置

5. **配置环境变量**：
   - 在项目设置中，导航到 "环境变量"
   - 添加 `NEXT_PUBLIC_API_BASE_URL` 环境变量
   - 可以为不同环境（生产/预览）设置不同的值

#### Cloudflare Pages 的优势：

- 全球 CDN 分发，提供极快的访问速度
- 自动 HTTPS 加密
- 无服务器函数支持
- 免费额度足够大多数小型项目使用
- 持续部署与预览环境

### Docker 部署

Docker 提供了一种封装应用及其依赖的方式，确保在任何环境中都能一致运行。

#### 步骤：

1. **创建 Dockerfile**：

```dockerfile
# 在项目根目录创建 Dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN pnpm build

# 生产环境
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# 设置正确的权限
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 复制构建输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

2. **创建 .dockerignore 文件**：

```
node_modules
.next
.git
```

3. **构建 Docker 镜像**：

```bash
docker build -t dify-dashboard .
```

4. **运行 Docker 容器**：

```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=https://your-dify-api-url.com dify-dashboard
```

### 传统服务器部署

如果您想在传统服务器上部署，可以使用 Node.js 运行构建后的应用。

#### 步骤：

1. **构建项目**：
   ```bash
   pnpm build
   ```

2. **启动生产服务器**：
   ```bash
   pnpm start
   ```

3. **使用进程管理器**（推荐）：
   
   使用 PM2 保持应用运行：
   ```bash
   # 安装 PM2
   npm install -g pm2
   
   # 启动应用
   pm2 start npm --name "dify-dashboard" -- start
   
   # 设置开机自启
   pm2 startup
   pm2 save
   ```

4. **配置 Nginx**（可选但推荐）：

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 环境变量配置

无论选择哪种部署方式，都需要配置以下环境变量：

| 环境变量 | 描述 | 示例 |
|---------|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | Dify API 的基础 URL | `https://api.dify.ai` |

### 配置方法：

1. **Vercel**：在项目设置的环境变量部分添加
2. **Docker**：使用 `-e` 参数或 docker-compose.yml 文件
3. **传统服务器**：创建 `.env.local` 文件或在启动命令中设置

## 常见问题解答

### Q: 部署后无法连接到 Dify API

**A**: 检查以下几点：
- 确保 `NEXT_PUBLIC_API_BASE_URL` 环境变量设置正确
- 确认 API 服务器允许来自您部署域名的跨域请求
- 检查网络防火墙设置是否阻止了请求

### Q: 部署后页面样式丢失

**A**: 这通常是因为静态资源路径配置不正确。确保：
- 在 `next.config.js` 中正确配置了 `basePath`（如果使用）
- 检查是否所有静态资源都被正确构建和复制

### Q: 如何更新已部署的应用？

**A**: 根据部署方式不同：
- **Vercel**: 推送到连接的 Git 仓库会自动触发重新部署
- **Docker**: 构建新镜像并重新运行容器
- **传统服务器**: 拉取最新代码，重新构建并重启服务

---

如有任何部署问题，请查看 [Next.js 部署文档](https://nextjs.org/docs/deployment) 或提交 GitHub Issue。
