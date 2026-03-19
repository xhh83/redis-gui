import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Edit2, Check, X, ArrowLeft, ArrowRight, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListEditorProps {
  items: string[];
  onSetItem: (index: number, value: string) => Promise<void>;
  onPush: (value: string, direction: 'left' | 'right') => Promise<void>;
  onRemove: (value: string) => Promise<void>;
}

export function ListEditor({ items, onSetItem, onPush, onRemove }: ListEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [addDirection, setAddDirection] = useState<'left' | 'right'>('right');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartEdit = (index: number, value: string) => {
    setEditingIndex(index);
    setEditValue(value);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null) return;
    setIsProcessing(true);
    try {
      await onSetItem(editingIndex, editValue);
      setEditingIndex(null);
      setEditValue('');
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    setIsProcessing(true);
    try {
      await onPush(newValue.trim(), addDirection);
      setNewValue('');
      setIsAdding(false);
    } catch (error) {
      console.error('添加失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (value: string) => {
    if (!confirm(`确定要删除元素 "${value}" 吗？`)) return;
    setIsProcessing(true);
    try {
      await onRemove(value);
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">List 元素</h3>
          <span className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground font-medium">
            {items.length}
          </span>
        </div>
        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-md text-xs gap-1"
            onClick={() => setIsAdding(true)}
            disabled={editingIndex !== null}
          >
            <Plus className="h-3 w-3" />
            添加元素
          </Button>
        )}
      </div>

      {/* 添加新元素 */}
      {isAdding && (
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-dashed border-primary/30 animate-[scaleIn_0.15s_ease-out]">
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="输入新元素的值"
            className="flex-1 h-8 font-mono text-sm bg-background"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewValue('');
              }
            }}
          />
          <div className="flex gap-1">
            <Button
              variant={addDirection === 'left' ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0 rounded"
              onClick={() => setAddDirection('left')}
              title="添加到头部 (LPUSH)"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={addDirection === 'right' ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0 rounded"
              onClick={() => setAddDirection('right')}
              title="添加到尾部 (RPUSH)"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            size="sm"
            className="h-8 rounded-md gap-1"
            onClick={handleAdd}
            disabled={isProcessing || !newValue.trim()}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded"
            onClick={() => {
              setIsAdding(false);
              setNewValue('');
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* 表格 */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-20 text-xs font-medium text-muted-foreground">Index</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Value</TableHead>
              <TableHead className="w-24 text-right text-xs font-medium text-muted-foreground">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={index}
                className={cn(
                  "group transition-colors",
                  editingIndex === index && "bg-primary/5"
                )}
              >
                <TableCell className="text-muted-foreground text-sm">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-muted rounded text-xs font-medium">
                    {index}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {editingIndex === index ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-8 font-mono text-sm bg-background"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate block">{item}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingIndex === index ? (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded hover:bg-success/10 hover:text-success"
                        onClick={handleSaveEdit}
                        disabled={isProcessing}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded"
                        onClick={() => handleStartEdit(index, item)}
                        disabled={isAdding}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(item)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                  <List className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">暂无元素</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}