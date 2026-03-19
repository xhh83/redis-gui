import { useConnectionStore } from '@/stores/connectionStore';
import { Plus, Server, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onAddConnection: () => void;
}

export function Sidebar({ onAddConnection }: SidebarProps) {
  const { connections, currentConnection, selectConnection, removeConnection } = useConnectionStore();

  return (
    <div className="w-56 border-r border-border/50 bg-muted/20 flex flex-col">
      {/* 标题栏 - 预留 macOS 红黄绿按钮空间 */}
      <div className="h-14 px-4 flex items-center justify-end border-b border-border/50 pt-8 bg-background/50">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={onAddConnection}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* 连接列表 */}
      <div className="flex-1 overflow-y-auto py-2">
        {connections.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            <Server className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium">暂无连接</p>
            <p className="text-xs mt-1 opacity-70">点击右上角添加</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 rounded-md"
              onClick={onAddConnection}
            >
              添加连接
            </Button>
          </div>
        ) : (
          <div className="space-y-0.5 px-2">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all duration-150",
                  currentConnection?.id === conn.id
                    ? "bg-primary/8 text-primary shadow-sm"
                    : "hover:bg-muted/80"
                )}
                onClick={() => selectConnection(conn.id)}
              >
                <Server className="h-4 w-4 shrink-0 opacity-70" />
                <span className="flex-1 truncate text-sm font-medium">{conn.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeConnection(conn.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight">Redis GUI</span>
        <span className="text-xs text-muted-foreground/60">v0.1.0</span>
      </div>
    </div>
  );
}