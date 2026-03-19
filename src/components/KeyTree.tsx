import { useEffect, useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, RefreshCw, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TreeNode {
  name: string;
  fullPath: string;
  isLeaf: boolean;
  children: Map<string, TreeNode>;
  keyType?: string;
}

interface KeyTreeProps {
  onAddKey?: () => void;
}

export function KeyTree({ onAddKey }: KeyTreeProps) {
  const { keys, searchPattern, selectKey, refreshKeys, setSearchPattern } = useDataStore();
  const { connectionStatus } = useConnectionStore();
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [localSearch, setLocalSearch] = useState('');

  // 刷新键列表
  useEffect(() => {
    if (connectionStatus === 'connected') {
      refreshKeys();
    }
  }, [connectionStatus, refreshKeys]);

  // 构建树形结构
  const buildTree = (keys: string[]): TreeNode => {
    const root: TreeNode = {
      name: '',
      fullPath: '',
      isLeaf: false,
      children: new Map(),
    };

    keys.forEach((key) => {
      const parts = key.split(':');
      let current = root;

      parts.forEach((part, index) => {
        const isLeaf = index === parts.length - 1;
        const fullPath = parts.slice(0, index + 1).join(':');

        if (!current.children.has(part)) {
          current.children.set(part, {
            name: part,
            fullPath,
            isLeaf,
            children: new Map(),
          });
        }

        current = current.children.get(part)!;
      });
    });

    return root;
  };

  // 切换展开状态
  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // 过滤键
  const filteredKeys = localSearch
    ? keys.filter((key) => key.toLowerCase().includes(localSearch.toLowerCase()))
    : keys;

  const tree = buildTree(filteredKeys);

  // 渲染树节点
  const renderNode = (node: TreeNode, depth: number = 0) => {
    const sortedChildren = Array.from(node.children.values()).sort((a, b) => {
      // 文件夹在前
      if (a.isLeaf !== b.isLeaf) return a.isLeaf ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    return sortedChildren.map((child) => {
      const isExpanded = expandedPaths.has(child.fullPath);
      const hasChildren = child.children.size > 0;

      return (
        <div key={child.fullPath}>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1.5 cursor-pointer rounded-md transition-all duration-150",
              "hover:bg-muted/70 text-sm group",
              child.isLeaf && "hover:bg-primary/5"
            )}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => {
              if (hasChildren) {
                toggleExpand(child.fullPath);
              }
              if (child.isLeaf) {
                selectKey(child.fullPath);
              }
            }}
          >
            {hasChildren ? (
              <>
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-150",
                    isExpanded && "rotate-90"
                  )}
                />
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
                ) : (
                  <Folder className="h-4 w-4 text-amber-500/80 shrink-0" />
                )}
              </>
            ) : (
              <>
                <span className="w-3.5" />
                <File className="h-4 w-4 text-blue-500/70 shrink-0" />
              </>
            )}
            <span className="truncate group-hover:text-foreground/90">{child.name}</span>
          </div>
          {hasChildren && isExpanded && (
            <div className="animate-[slideIn_0.15s_ease-out]">
              {renderNode(child, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* 搜索栏 */}
      <div className="p-2 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input
            placeholder="搜索键..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/30 border-transparent focus:border-primary/30 focus:bg-background transition-colors"
          />
        </div>
      </div>

      {/* 工具栏 */}
      <div className="px-2.5 py-1.5 border-b border-border/50 flex items-center justify-between bg-muted/10">
        <span className="text-xs text-muted-foreground font-medium">
          {filteredKeys.length} 个键
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={onAddKey}
            title="新增键"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={refreshKeys}
            title="刷新"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 键树 */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredKeys.length === 0 && localSearch === '' ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-8">
            <File className="h-8 w-8 mb-2 opacity-40" />
            <p className="font-medium">暂无数据</p>
          </div>
        ) : filteredKeys.length === 0 && localSearch ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-8">
            <Search className="h-8 w-8 mb-2 opacity-40" />
            <p className="font-medium">未找到匹配项</p>
          </div>
        ) : (
          renderNode(tree)
        )}
      </div>
    </div>
  );
}