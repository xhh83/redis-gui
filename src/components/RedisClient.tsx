'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { KeyTree } from './KeyTree';
import { ValueEditor } from './ValueEditor';
import { ConnectionModal } from './ConnectionModal';
import { AddKeyModal } from './AddKeyModal';
import { useConnectionStore } from '@/stores/connectionStore';
import { useDataStore } from '@/stores/dataStore';

export default function RedisClient() {
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const { currentConnection, isLoaded, loadConnections } = useConnectionStore();
  const { selectedKey } = useDataStore();

  // 加载保存的连接配置
  useEffect(() => {
    if (!isLoaded) {
      loadConnections();
    }
  }, [isLoaded, loadConnections]);

  return (
    <div className="flex h-full bg-background">
      {/* 左侧连接列表 */}
      <Sidebar onAddConnection={() => setShowConnectionModal(true)} />

      {/* 中间键列表 */}
      <div className="w-64 border-r border-border/50 bg-muted/10">
        {currentConnection ? (
          <KeyTree onAddKey={() => setShowAddKeyModal(true)} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-muted-foreground/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </div>
              <p className="font-medium">请先连接 Redis</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                在左侧添加或选择连接
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 右侧值编辑区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedKey ? (
          <ValueEditor />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-muted-foreground/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <p className="font-medium">选择一个键查看内容</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                从中间面板选择或搜索键
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 连接弹窗 */}
      <ConnectionModal
        open={showConnectionModal}
        onOpenChange={setShowConnectionModal}
      />

      {/* 新增键弹窗 */}
      <AddKeyModal
        open={showAddKeyModal}
        onOpenChange={setShowAddKeyModal}
      />
    </div>
  );
}