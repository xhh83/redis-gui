import { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { redisService } from '@/services/redisService';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AddKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddKeyModal({ open, onOpenChange }: AddKeyModalProps) {
  const { refreshKeys, selectKey } = useDataStore();
  const [keyName, setKeyName] = useState('');
  const [keyType, setKeyType] = useState<string>('string');
  const [ttl, setTTL] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // String
  const [stringValue, setStringValue] = useState('');

  // Hash
  const [hashFields, setHashFields] = useState<{ field: string; value: string }[]>([
    { field: '', value: '' },
  ]);

  // List
  const [listItems, setListItems] = useState<string[]>(['']);

  // Set
  const [setMembers, setSetMembers] = useState<string[]>(['']);

  // ZSet
  const [zsetMembers, setZsetMembers] = useState<{ member: string; score: string }[]>([
    { member: '', score: '0' },
  ]);

  const resetForm = () => {
    setKeyName('');
    setKeyType('string');
    setTTL('');
    setStringValue('');
    setHashFields([{ field: '', value: '' }]);
    setListItems(['']);
    setSetMembers(['']);
    setZsetMembers([{ member: '', score: '0' }]);
    setError(null);
  };

  const handleCreate = async () => {
    if (!keyName.trim()) {
      setError('请输入键名');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ttlValue = ttl ? parseInt(ttl) : undefined;

      switch (keyType) {
        case 'string':
          if (!stringValue.trim()) {
            throw new Error('请输入值');
          }
          await redisService.setString(keyName, stringValue, ttlValue);
          break;

        case 'hash':
          const validHashFields = hashFields.filter((f) => f.field.trim() && f.value.trim());
          if (validHashFields.length === 0) {
            throw new Error('请至少添加一个有效的字段');
          }
          for (const f of validHashFields) {
            await redisService.setHashField(keyName, f.field, f.value);
          }
          if (ttlValue) await redisService.setTTL(keyName, ttlValue);
          break;

        case 'list':
          const validListItems = listItems.filter((item) => item.trim());
          if (validListItems.length === 0) {
            throw new Error('请至少添加一个有效的元素');
          }
          for (const item of validListItems) {
            await redisService.pushList(keyName, item, 'right');
          }
          if (ttlValue) await redisService.setTTL(keyName, ttlValue);
          break;

        case 'set':
          const validSetMembers = setMembers.filter((m) => m.trim());
          if (validSetMembers.length === 0) {
            throw new Error('请至少添加一个有效的成员');
          }
          for (const member of validSetMembers) {
            await redisService.addSetMember(keyName, member);
          }
          if (ttlValue) await redisService.setTTL(keyName, ttlValue);
          break;

        case 'zset':
          const validZsetMembers = zsetMembers.filter((m) => m.member.trim());
          if (validZsetMembers.length === 0) {
            throw new Error('请至少添加一个有效的成员');
          }
          for (const m of validZsetMembers) {
            await redisService.addZSetMember(keyName, m.member, parseFloat(m.score) || 0);
          }
          if (ttlValue) await redisService.setTTL(keyName, ttlValue);
          break;

        default:
          throw new Error('不支持的数据类型');
      }

      await refreshKeys();
      selectKey(keyName);
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base">新增键</DialogTitle>
          <DialogDescription className="text-xs">创建一个新的 Redis 键</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-5 py-4">
          {/* 键名 */}
          <div className="grid gap-1.5">
            <Label htmlFor="keyName" className="text-xs">键名</Label>
            <Input
              id="keyName"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="例如: user:1:name"
              className="h-8 text-sm font-mono"
            />
          </div>

          {/* 类型选择 */}
          <div className="grid gap-1.5">
            <Label className="text-xs">数据类型</Label>
            <Select value={keyType} onValueChange={setKeyType}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="hash">Hash</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="set">Set</SelectItem>
                <SelectItem value="zset">ZSet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TTL */}
          <div className="grid gap-1.5">
            <Label htmlFor="ttl" className="text-xs">TTL (秒，可选)</Label>
            <Input
              id="ttl"
              type="number"
              value={ttl}
              onChange={(e) => setTTL(e.target.value)}
              placeholder="留空表示永不过期"
              className="h-8 text-sm"
            />
          </div>

          {/* 值输入区域 */}
          <div className="grid gap-1.5">
            <Label className="text-xs">值</Label>

            {keyType === 'string' && (
              <Textarea
                value={stringValue}
                onChange={(e) => setStringValue(e.target.value)}
                placeholder="输入字符串值..."
                className="min-h-[120px] font-mono text-sm bg-muted/30 focus:bg-background transition-colors"
              />
            )}

            {keyType === 'hash' && (
              <div className="space-y-2">
                {hashFields.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Field"
                      value={f.field}
                      onChange={(e) => {
                        const newFields = [...hashFields];
                        newFields[i].field = e.target.value;
                        setHashFields(newFields);
                      }}
                      className="flex-1 h-8 text-sm font-mono"
                    />
                    <Input
                      placeholder="Value"
                      value={f.value}
                      onChange={(e) => {
                        const newFields = [...hashFields];
                        newFields[i].value = e.target.value;
                        setHashFields(newFields);
                      }}
                      className="flex-1 h-8 text-sm font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (hashFields.length > 1) {
                          setHashFields(hashFields.filter((_, idx) => idx !== i));
                        }
                      }}
                      disabled={hashFields.length === 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-md"
                  onClick={() => setHashFields([...hashFields, { field: '', value: '' }])}
                >
                  + 添加字段
                </Button>
              </div>
            )}

            {keyType === 'list' && (
              <div className="space-y-2">
                {listItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`元素 ${i + 1}`}
                      value={item}
                      onChange={(e) => {
                        const newItems = [...listItems];
                        newItems[i] = e.target.value;
                        setListItems(newItems);
                      }}
                      className="flex-1 h-8 text-sm font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (listItems.length > 1) {
                          setListItems(listItems.filter((_, idx) => idx !== i));
                        }
                      }}
                      disabled={listItems.length === 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-md"
                  onClick={() => setListItems([...listItems, ''])}
                >
                  + 添加元素
                </Button>
              </div>
            )}

            {keyType === 'set' && (
              <div className="space-y-2">
                {setMembers.map((member, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`成员 ${i + 1}`}
                      value={member}
                      onChange={(e) => {
                        const newMembers = [...setMembers];
                        newMembers[i] = e.target.value;
                        setSetMembers(newMembers);
                      }}
                      className="flex-1 h-8 text-sm font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (setMembers.length > 1) {
                          setSetMembers(setMembers.filter((_, idx) => idx !== i));
                        }
                      }}
                      disabled={setMembers.length === 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-md"
                  onClick={() => setSetMembers([...setMembers, ''])}
                >
                  + 添加成员
                </Button>
              </div>
            )}

            {keyType === 'zset' && (
              <div className="space-y-2">
                {zsetMembers.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="成员"
                      value={m.member}
                      onChange={(e) => {
                        const newMembers = [...zsetMembers];
                        newMembers[i].member = e.target.value;
                        setZsetMembers(newMembers);
                      }}
                      className="flex-1 h-8 text-sm font-mono"
                    />
                    <Input
                      type="number"
                      placeholder="分数"
                      value={m.score}
                      onChange={(e) => {
                        const newMembers = [...zsetMembers];
                        newMembers[i].score = e.target.value;
                        setZsetMembers(newMembers);
                      }}
                      className="w-24 h-8 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (zsetMembers.length > 1) {
                          setZsetMembers(zsetMembers.filter((_, idx) => idx !== i));
                        }
                      }}
                      disabled={zsetMembers.length === 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-md"
                  onClick={() => setZsetMembers([...zsetMembers, { member: '', score: '0' }])}
                >
                  + 添加成员
                </Button>
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="px-3 py-2 rounded-md text-xs bg-destructive/10 text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-4 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-md"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs rounded-md"
            onClick={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? '创建中...' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}