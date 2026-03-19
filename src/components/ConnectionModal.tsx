import { useState } from 'react';
import { useConnectionStore } from '@/stores/connectionStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Check, X } from 'lucide-react';
import type { ConnectionConfig } from '@/types/redis';

interface ConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectionModal({ open, onOpenChange }: ConnectionModalProps) {
  const { addConnection, testConnection } = useConnectionStore();

  const [connectionType, setConnectionType] = useState<'standalone' | 'cluster'>('standalone');
  const [name, setName] = useState('');
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState('6379');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [db, setDb] = useState('0');
  const [clusterNodes, setClusterNodes] = useState('127.0.0.1:7000\n127.0.0.1:7001\n127.0.0.1:7002');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const resetForm = () => {
    setName('');
    setHost('127.0.0.1');
    setPort('6379');
    setPassword('');
    setUsername('');
    setDb('0');
    setClusterNodes('127.0.0.1:7000\n127.0.0.1:7001\n127.0.0.1:7002');
    setTestResult(null);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    const config = buildConfig();
    const result = await testConnection(config);

    setTestResult({
      success: result.success,
      message: result.success ? '连接成功！' : result.error || '连接失败',
    });
    setIsTesting(false);

    // 测试成功后断开测试连接
    if (result.success) {
      await useConnectionStore.getState().disconnect();
    }
  };

  const buildConfig = (): Omit<ConnectionConfig, 'id' | 'createdAt' | 'updatedAt'> => {
    if (connectionType === 'cluster') {
      const nodes = clusterNodes
        .split('\n')
        .map((line) => {
          const [h, p] = line.trim().split(':');
          return { host: h, port: parseInt(p, 10) };
        })
        .filter((n) => n.host && n.port);

      return {
        name: name || 'Redis Cluster',
        type: 'cluster',
        nodes,
        password: password || undefined,
        username: username || undefined,
        tls: false,
      };
    }

    return {
      name: name || `${host}:${port}`,
      type: 'standalone',
      host,
      port: parseInt(port, 10),
      password: password || undefined,
      username: username || undefined,
      db: parseInt(db, 10),
      tls: false,
    };
  };

  const handleSave = () => {
    const config = buildConfig();
    addConnection(config);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base">添加连接</DialogTitle>
          <DialogDescription className="text-xs">
            配置 Redis 连接参数，支持单机和集群模式
          </DialogDescription>
        </DialogHeader>

        <Tabs value={connectionType} onValueChange={(v) => setConnectionType(v as 'standalone' | 'cluster')} className="px-5">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="standalone" className="text-xs">单机</TabsTrigger>
            <TabsTrigger value="cluster" className="text-xs">集群</TabsTrigger>
          </TabsList>

          <TabsContent value="standalone" className="space-y-3 mt-4">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="name" className="text-xs">名称</Label>
                <Input
                  id="name"
                  placeholder="我的 Redis"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5 col-span-2">
                  <Label htmlFor="host" className="text-xs">主机</Label>
                  <Input
                    id="host"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="port" className="text-xs">端口</Label>
                  <Input
                    id="port"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password" className="text-xs">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="username" className="text-xs">用户名</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="db" className="text-xs">数据库</Label>
                  <Input
                    id="db"
                    type="number"
                    min="0"
                    max="15"
                    value={db}
                    onChange={(e) => setDb(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cluster" className="space-y-3 mt-4">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="cluster-name" className="text-xs">名称</Label>
                <Input
                  id="cluster-name"
                  placeholder="我的 Redis 集群"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cluster-nodes" className="text-xs">节点列表</Label>
                <textarea
                  id="cluster-nodes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="每行一个节点，格式：host:port"
                  value={clusterNodes}
                  onChange={(e) => setClusterNodes(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cluster-password" className="text-xs">密码</Label>
                <Input
                  id="cluster-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {testResult && (
          <div className="px-5">
            <div
              className={`px-3 py-2 rounded-md text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {testResult.success ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              {testResult.message}
            </div>
          </div>
        )}

        <DialogFooter className="px-5 py-4 border-t border-border/50 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleTest}
            disabled={isTesting}
          >
            {isTesting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
            测试连接
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}