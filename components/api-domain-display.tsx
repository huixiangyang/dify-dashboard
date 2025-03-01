'use client';

import React, { useState, useEffect } from "react";
import { Link } from "@heroui/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ApiDomainDisplay() {
  const { apiDomain } = useAuth();
  const [displayDomain, setDisplayDomain] = useState<string>('');

  // 使用useEffect确保代码只在客户端执行
  useEffect(() => {
    // 格式化域名显示，移除协议前缀
    const formatDomain = (domain: string) => {
      if (!domain) return '未设置域名';
      return domain.replace(/^https?:\/\//, '');
    };

    setDisplayDomain(formatDomain(apiDomain));
  }, [apiDomain]);

  return (
    <Link
      isExternal
      className="flex items-center gap-1 text-current text-sm"
      href={apiDomain || '#'}
      title="API服务域名"
    >
      <span className="text-default-600">API服务由</span>
      <p className="text-primary">{displayDomain}</p>
      <span className="text-default-600">提供</span>
    </Link>
  );
}
