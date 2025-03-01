'use client';

import React, { useEffect, useState } from 'react';
import { fetchApps, fetchAppApiKeys, createAppApiKey, deleteAppApiKey, AppData, ApiKey, exportApp, copyApp, deleteApp, exportAllApps } from '@/services/apps';
import { useRouter } from 'next/navigation';
import { getEmojiFromName } from '@/utils/emoji';
import { Button } from '@heroui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Tooltip } from '@heroui/tooltip';
import { Input } from '@heroui/input';
import { ChevronDownIcon, ChevronUpIcon, ExportIcon, CopyIcon, DeleteIcon } from '@/components/icons';

export default function AppsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<AppData[]>([]);
  const [appApiKeys, setAppApiKeys] = useState<Record<string, ApiKey[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingApiKeys, setLoadingApiKeys] = useState<Record<string, boolean>>({});
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [creatingApiKey, setCreatingApiKey] = useState<string | null>(null);
  const [deletingApiKey, setDeletingApiKey] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<ApiKey | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedApps, setExpandedApps] = useState<Record<string, boolean>>({});
  const [copyingApp, setCopyingApp] = useState<string | null>(null);
  const [exportingApp, setExportingApp] = useState<string | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyAppData, setCopyAppData] = useState({
    name: '',
    icon_type: 'emoji',
    icon: '🤖',
    icon_background: '#D1E0FF',
    mode: 'advanced-chat'
  });
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [deletingApp, setDeletingApp] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<AppData | null>(null);
  const [exportingAllApps, setExportingAllApps] = useState(false);

  // 获取应用列表
  const fetchAppsList = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchApps(page, 30, '', false);
      
      if (response) {
        setApps(response.data);
        setHasMore(response.has_more);
        setTotal(response.total);
        
        // 初始化加载状态
        const initialLoadingState: Record<string, boolean> = {};
        const initialExpandedState: Record<string, boolean> = {};
        response.data.forEach(app => {
          initialLoadingState[app.id] = false;
          initialExpandedState[app.id] = false;
        });
        setLoadingApiKeys(initialLoadingState);
        setExpandedApps(initialExpandedState);
        
        // 为每个应用加载 API 密钥
        response.data.forEach(app => {
          loadAppApiKeys(app.id);
        });
      } else {
        setError('获取应用列表失败');
      }
    } catch (err) {
      setError('获取应用列表时发生错误');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppsList();
  }, [page]);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const loadAppApiKeys = async (appId: string) => {
    setLoadingApiKeys(prev => ({ ...prev, [appId]: true }));
    
    try {
      const response = await fetchAppApiKeys(appId);
      
      if (response) {
        setAppApiKeys(prev => ({
          ...prev,
          [appId]: response.data
        }));
      }
    } catch (err) {
      console.error(`获取应用 ${appId} 的 API 密钥失败:`, err);
    } finally {
      setLoadingApiKeys(prev => ({ ...prev, [appId]: false }));
    }
  };

  const navigateToAppDetail = (appId: string) => {
    if (!appId) {
      console.error('无效的应用ID');
      return;
    }
    
    // 确保ID格式正确
    const cleanId = appId.trim();
    if (!cleanId.match(/^[a-zA-Z0-9-]+$/)) {
      console.error('应用ID格式不正确:', appId);
      return;
    }
    
    router.push(`/apps/${cleanId}`);
  };
  
  const copyApiKey = (e: React.MouseEvent, apiKey: string) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
    
    navigator.clipboard.writeText(apiKey)
      .then(() => {
        setCopySuccess(apiKey);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };
  
  const handleCreateApiKey = async (e: React.MouseEvent, appId: string) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
    
    setCreatingApiKey(appId);
    
    try {
      const newKey = await createAppApiKey(appId);
      
      if (newKey) {
        // 更新应用的 API 密钥列表
        setAppApiKeys(prev => ({
          ...prev,
          [appId]: [...(prev[appId] || []), newKey]
        }));
        
        // 保存新创建的密钥，用于显示在模态框中
        setNewApiKey(newKey);
        setIsModalOpen(true); // 打开模态框
      }
    } catch (err) {
      console.error('创建 API 密钥失败:', err);
    } finally {
      setCreatingApiKey(null);
    }
  };
  
  const handleDeleteApiKey = async (e: React.MouseEvent, appId: string, keyId: string) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
    
    if (confirm('确定要删除此 API 密钥吗？此操作无法撤销，并且将使使用此密钥的应用无法访问 API。')) {
      setDeletingApiKey(keyId);
      
      try {
        const success = await deleteAppApiKey(appId, keyId);
        
        if (success) {
          // 从应用的 API 密钥列表中移除已删除的密钥
          setAppApiKeys(prev => ({
            ...prev,
            [appId]: (prev[appId] || []).filter(key => key.id !== keyId)
          }));
        }
      } catch (err) {
        console.error('删除 API 密钥失败:', err);
      } finally {
        setDeletingApiKey(null);
      }
    }
  };

  const handleExportApp = async (appId: string) => {
    setExportingApp(appId);
    
    try {
      const response = await exportApp(appId, false);
      if (response && response.data) {
        // 找到当前应用
        const app = apps.find(app => app.id === appId);
        const fileName = app ? `${app.name}.yml` : `app-${appId}.yml`;
        
        // 创建下载链接
        const blob = new Blob([response.data], { type: 'application/yaml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('导出应用失败:', error);
    } finally {
      setExportingApp(null);
    }
  };

  const handleCopyApp = (appId: string) => {
    setSelectedAppId(appId);
    
    // 找到当前应用，预填复制表单
    const app = apps.find(app => app.id === appId);
    if (app) {
      setCopyAppData({
        name: `${app.name} 副本`,
        icon_type: app.icon_type,
        icon: app.icon,
        icon_background: app.icon_background,
        mode: app.mode
      });
    }
    
    setIsCopyModalOpen(true);
  };

  const submitCopyApp = async () => {
    if (!selectedAppId || !copyAppData.name) return;
    
    setCopyingApp(selectedAppId);
    
    try {
      const newApp = await copyApp(selectedAppId, copyAppData);
      
      if (newApp) {
        // 刷新应用列表
        fetchAppsList();
        setIsCopyModalOpen(false);
        
        // 重置表单
        setCopyAppData({
          name: '',
          icon_type: '',
          icon: '',
          icon_background: '',
          mode: ''
        });
      }
    } catch (error) {
      console.error('复制应用失败:', error);
    } finally {
      setCopyingApp(null);
      setSelectedAppId(null);
    }
  };

  const handleDeleteApp = (app: AppData) => {
    setAppToDelete(app);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteApp = async () => {
    if (!appToDelete) return;
    
    setDeletingApp(appToDelete.id);
    
    try {
      const success = await deleteApp(appToDelete.id);
      
      if (success) {
        // 刷新应用列表
        fetchAppsList();
        setIsDeleteModalOpen(false);
        setAppToDelete(null);
      }
    } catch (error) {
      console.error('删除应用失败:', error);
    } finally {
      setDeletingApp(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const toggleApiKeysVisibility = (appId: string) => {
    setExpandedApps(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
    
    // 如果没有加载过 API 密钥，则加载
    if (!appApiKeys[appId] && !loadingApiKeys[appId]) {
      loadAppApiKeys(appId);
    }
  };

  const handleExportAllApps = async () => {
    try {
      setExportingAllApps(true);
      const blob = await exportAllApps();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dify-apps-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('导出所有应用失败:', error);
      // 可以添加错误提示
    } finally {
      setExportingAllApps(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-end items-center mb-8 gap-2">
        <Button
          color="primary"
          variant="flat"
          size="md"
          startContent={<ExportIcon className="w-4 h-4" />}
          onPress={handleExportAllApps}
          isLoading={exportingAllApps}
        >
          zip备份全部{total} 个应用
        </Button>
      </div>

      {isLoading && apps.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p>加载应用列表中...</p>
        </div>
      ) : error ? (
        <div className="bg-danger-50 text-danger p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-default-100 p-6 rounded-lg text-center">
          <p>暂无应用</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map(app => (
              <div 
                key={app.id} 
                className="bg-content1 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-default-100"
              >
                <div className="p-6 relative" onClick={() => navigateToAppDetail(app.id)}>
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${app.icon_type === 'emoji' ? app.icon_background : ''}`}
                      style={{ backgroundColor: app.icon_type === 'emoji' ? app.icon_background : 'transparent' }}
                    >
                      {app.icon_type === 'emoji' ? getEmojiFromName(app.icon) : (
                        <img src={app.icon_url || ''} alt={app.name} className="w-full h-full object-cover rounded-lg" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{app.name}</h3>
                      <p className="text-xs text-default-500 mt-1">{app.description || '无描述'}</p>
                      <p className="text-xs text-default-500">
                        {app.mode} · 创建于 {new Date(app.created_at * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      isLoading={loadingApiKeys[app.id]}
                      onClick={(e) => handleCreateApiKey(e, app.id)}
                      className="text-xs font-medium"
                    >
                      创建秘钥
                    </Button>
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      startContent={<ExportIcon className="w-4 h-4" />}
                      onPress={() => handleExportApp(app.id)}
                      isLoading={exportingApp === app.id}
                      className="text-xs font-medium"
                    >
                      导出
                    </Button>
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      startContent={<CopyIcon className="w-4 h-4" />}
                      onPress={() => handleCopyApp(app.id)}
                      isLoading={copyingApp === app.id}
                      className="text-xs font-medium"
                    >
                      复制
                    </Button>
                    <Button
                      color="danger"
                      variant="flat"
                      size="sm"
                      startContent={<DeleteIcon className="w-4 h-4" />}
                      onPress={() => handleDeleteApp(app)}
                      isLoading={deletingApp === app.id}
                      className="text-xs font-medium"
                    >
                      删除
                    </Button>
                  </div>
                </div>
                    
                {/* 秘钥栏 */}
                <div className="border-t border-default-100 p-5 bg-default-50" onClick={(e) => e.stopPropagation()}>
                  <div 
                    className="flex items-center justify-between mb-2 cursor-pointer hover:bg-default-100 p-2 rounded-md transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleApiKeysVisibility(app.id);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">API 秘钥</span>
                      {appApiKeys[app.id] && !loadingApiKeys[app.id] && (
                        <span className="text-xs bg-default-200 px-2 py-0.5 rounded-full">
                          {appApiKeys[app.id].length}
                        </span>
                      )}
                    </div>
                    <div>
                      {expandedApps[app.id] ? 
                        <ChevronUpIcon className="w-4 h-4" /> : 
                        <ChevronDownIcon className="w-4 h-4" />
                      }
                    </div>
                  </div>
                  
                  {expandedApps[app.id] && (
                    loadingApiKeys[app.id] ? (
                      <div className="text-xs text-default-500 py-2 flex justify-center items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                        加载密钥中...
                      </div>
                    ) : !appApiKeys[app.id] || appApiKeys[app.id].length === 0 ? (
                      <div className="text-xs text-default-500 py-3 text-center bg-default-100 rounded-lg">暂无 API 密钥</div>
                    ) : (
                      <div className="space-y-2 mt-3">
                        {appApiKeys[app.id].map(key => (
                          <div 
                            key={key.id} 
                            className="flex items-center justify-between bg-default-100 p-3 rounded-lg hover:bg-default-200 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip content={key.token} placement="bottom">
                              <div className="text-xs font-mono truncate max-w-[150px] bg-default-200 px-2 py-1 rounded">
                                {key.token.substring(0, 10)}...{key.token.substring(key.token.length - 4)}
                              </div>
                            </Tooltip>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                color={copySuccess === key.token ? "success" : "primary"}
                                variant="flat"
                                onClick={(e) => copyApiKey(e, key.token)}
                                className="text-xs min-w-[60px] font-medium"
                              >
                                {copySuccess === key.token ? '已复制' : '复制'}
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                isLoading={deletingApiKey === key.id}
                                onClick={(e) => handleDeleteApiKey(e, app.id, key.id)}
                                className="text-xs font-medium"
                              >
                                删除
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="mt-8 text-center">
              <button 
                onClick={loadMore}
                disabled={isLoading}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 font-medium transition-colors"
              >
                {isLoading ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}
        </>
      )}
      
      {/* 新创建的 API 密钥模态框 */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span className="text-xl font-semibold">API 密钥已创建</span>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500 mb-3">
              请保存此 API 密钥，它只会显示一次。如果丢失，您需要创建一个新的密钥。
            </p>
            <Input
              type="text"
              value={newApiKey?.token || ''}
              readOnly
              variant="bordered"
              className="font-mono bg-default-50"
              endContent={
                <Button
                  size="sm"
                  color={copySuccess === newApiKey?.token ? "success" : "primary"}
                  variant="flat"
                  onClick={(e) => newApiKey && copyApiKey(e, newApiKey.token)}
                  className="font-medium"
                >
                  {copySuccess === newApiKey?.token ? '已复制' : '复制'}
                </Button>
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={closeModal} className="font-medium">
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* 复制应用模态框 */}
      <Modal isOpen={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span className="text-xl font-semibold">复制应用</span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">应用名称</label>
                <Input
                  type="text"
                  value={copyAppData.name}
                  onChange={(e) => setCopyAppData({...copyAppData, name: e.target.value})}
                  variant="bordered"
                  placeholder="输入应用名称"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">图标</label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: copyAppData.icon_background }}
                  >
                    {copyAppData.icon_type === 'emoji' ? getEmojiFromName(copyAppData.icon) : '🤖'}
                  </div>
                  <span className="text-xs text-default-500">
                    将使用原应用的图标设置
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">应用模式</label>
                <Input
                  type="text"
                  value={copyAppData.mode}
                  disabled
                  variant="bordered"
                />
                <p className="text-xs text-default-500 mt-1">
                  将使用原应用的模式
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="flat" 
              onPress={() => setIsCopyModalOpen(false)}
              className="font-medium"
            >
              取消
            </Button>
            <Button 
              color="primary" 
              onPress={submitCopyApp}
              isLoading={copyingApp === selectedAppId}
              className="font-medium"
            >
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* 删除应用模态框 */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span className="text-xl font-semibold">删除应用</span>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500 mb-3">
              确定要删除应用 {appToDelete?.name} 吗？此操作无法撤销，并且将删除所有相关数据。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="flat" 
              onPress={() => setIsDeleteModalOpen(false)}
              className="font-medium"
            >
              取消
            </Button>
            <Button 
              color="danger" 
              onPress={confirmDeleteApp}
              isLoading={deletingApp === appToDelete?.id}
              className="font-medium"
            >
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
