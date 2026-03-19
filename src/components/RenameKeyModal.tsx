import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

interface RenameKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKey: string;
  onRename: (newKey: string) => Promise<boolean>;
  existingKeys: string[];
}

export function RenameKeyModal({
  open,
  onOpenChange,
  currentKey,
  onRename,
  existingKeys,
}: RenameKeyModalProps) {
  const [newKey, setNewKey] = useState(currentKey);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setNewKey(currentKey);
      setError('');
    }
  }, [open, currentKey]);

  const validate = (): boolean => {
    if (!newKey.trim()) {
      setError('Key 不能为空');
      return false;
    }
    if (newKey === currentKey) {
      setError('新 Key 与当前 Key 相同');
      return false;
    }
    if (existingKeys.includes(newKey.trim())) {
      setError('Key 已存在，重命名会覆盖现有 Key');
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsProcessing(true);
    try {
      const success = await onRename(newKey.trim());
      if (success) {
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '重命名失败');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base">重命名 Key</DialogTitle>
          <DialogDescription className="text-xs">
            为当前 Key 设置一个新名称
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 px-5 py-4">
          <div className="grid gap-1.5">
            <Label htmlFor="current-key" className="text-xs">当前 Key</Label>
            <Input
              id="current-key"
              value={currentKey}
              readOnly
              className="h-8 text-sm font-mono bg-muted/30 border-transparent"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-key" className="text-xs">新 Key</Label>
            <Input
              id="new-key"
              value={newKey}
              onChange={(e) => {
                setNewKey(e.target.value);
                setError('');
              }}
              className="h-8 text-sm font-mono"
              placeholder="输入新的 Key 名称"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs bg-destructive/10 text-destructive">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="px-5 py-4 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-md"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            取消
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs rounded-md"
            onClick={handleSubmit}
            disabled={isProcessing || !newKey.trim() || newKey === currentKey}
          >
            {isProcessing ? '处理中...' : '确认重命名'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}