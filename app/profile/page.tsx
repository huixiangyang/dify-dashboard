"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";

import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { userInfo, refreshUserInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 只在组件挂载时获取一次用户信息
  useEffect(() => {
    const fetchData = async () => {
      if (!userInfo) {
        setIsLoading(true);
        await refreshUserInfo();
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // 移除 refreshUserInfo 依赖，避免无限循环

  // 手动刷新用户信息的函数
  const handleRefresh = async () => {
    setIsLoading(true);
    await refreshUserInfo();
    setIsLoading(false);
  };

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="max-w-md w-full">
          <CardBody className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-default-200 animate-pulse" />
              <p className="text-default-500">加载用户信息中...</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // 格式化日期时间显示
  const formatDateTime = (timestamp: number | undefined) => {
    if (!timestamp) return "未知";
    const date = new Date(timestamp * 1000);

    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 用户基本信息卡片 */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center gap-3 pb-6">
            <Avatar
              className="w-24 h-24 text-2xl bg-primary text-white"
              name={userInfo.name || userInfo.email}
            />
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold">
                {userInfo.name || "未设置名称"}
              </h2>
              <p className="text-default-500">{userInfo.email}</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              <div>
                <p className="text-small text-default-500">用户ID</p>
                <p className="text-sm font-medium truncate">{userInfo.id}</p>
              </div>
              <div>
                <p className="text-small text-default-500">创建时间</p>
                <p className="text-sm font-medium">
                  {formatDateTime(userInfo.created_at)}
                </p>
              </div>
              <div>
                <p className="text-small text-default-500">上次登录</p>
                <p className="text-sm font-medium">
                  {formatDateTime(userInfo.last_login_at)}
                </p>
                <p className="text-xs text-default-400 mt-1">
                  IP: {userInfo.last_login_ip || "未知"}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 用户详细信息卡片 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h3 className="text-xl font-bold">账户详情</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center">
                  <span className="w-1 h-4 bg-primary rounded-full mr-2" />
                  偏好设置
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
                  <div className="p-3 bg-default-50 rounded-lg">
                    <p className="text-small text-default-500">界面语言</p>
                    <p className="text-sm font-medium">
                      {userInfo.interface_language || "默认"}
                    </p>
                  </div>
                  <div className="p-3 bg-default-50 rounded-lg">
                    <p className="text-small text-default-500">界面主题</p>
                    <p className="text-sm font-medium capitalize">
                      {userInfo.interface_theme || "默认"}
                    </p>
                  </div>
                  <div className="p-3 bg-default-50 rounded-lg">
                    <p className="text-small text-default-500">时区</p>
                    <p className="text-sm font-medium">
                      {userInfo.timezone || "默认"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center">
                  <span className="w-1 h-4 bg-primary rounded-full mr-2" />
                  账户状态
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
                  <div className="p-3 bg-default-50 rounded-lg">
                    <p className="text-small text-default-500">密码设置</p>
                    <p className="text-sm font-medium">
                      {userInfo.is_password_set ? "已设置" : "未设置"}
                    </p>
                  </div>
                  <div className="p-3 bg-default-50 rounded-lg flex items-center">
                    <div>
                      <p className="text-small text-default-500">账户活跃度</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <p className="text-sm font-medium">活跃</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-end">
            <Button
              className="min-w-[120px]"
              color="primary"
              isLoading={isLoading}
              onClick={handleRefresh}
            >
              刷新信息
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
