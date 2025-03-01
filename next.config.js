/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用构建时的 ESLint 检查
  eslint: {
    // 在生产构建期间忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
