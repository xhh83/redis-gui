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
import { Plus, Trash2, Edit2, Check, X, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HashEditorProps {
  fields: Record<string, string>;
  onSetField: (field: string, value: string) => Promise<void>;
  onDeleteField: (field: string) => Promise<void>;
}

interface EditingState {
  field: string;
  value: string;
  isNew: boolean;
}

export function HashEditor({ fields, onSetField, onDeleteField }: HashEditorProps) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [newField, setNewField] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartEdit = (field: string, value: string) => {
    setEditing({ field, value, isNew: false });
  };

  const handleCancelEdit = () => {
    setEditing(null);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setIsProcessing(true);
    try {
      await onSetField(editing.field, editing.value);
      setEditing(null);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddField = async () => {
    if (!newField.trim()) return;
    setIsProcessing(true);
    try {
      await onSetField(newField.trim(), newValue);
      setNewField('');
      setNewValue('');
      setIsAdding(false);
    } catch (error) {
      console.error('添加失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (field: string) => {
    if (!confirm(`确定要删除字段 "${field}" 吗？`)) return;
    setIsProcessing(true);
    try {
      await onDeleteField(field);
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const entries = Object.entries(fields);

  return (
    <div className="p-4 space-y-4">
      {/* 标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Hash 字段</h3>
          <span className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground font-medium">
            {entries.length}
          </span>
        </div>
        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-md text-xs gap-1"
            onClick={() => setIsAdding(true)}
            disabled={editing !== null}
          >
            <Plus className="h-3 w-3" />
            添加字段
          </Button>
        )}
      </div>

      {/* 表格 */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[40%] text-xs font-medium text-muted-foreground">Field</TableHead>
              <TableHead className="w-[40%] text-xs font-medium text-muted-foreground">Value</TableHead>
              <TableHead className="w-[20%] text-right text-xs font-medium text-muted-foreground">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow className="bg-primary/5 animate-[slideIn_0.15s_ease-out]">
                <TableCell>
                  <Input
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    placeholder="字段名"
                    className="h-8 font-mono text-sm bg-background"
                    autoFocus
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="值"
                    className="h-8 font-mono text-sm bg-background"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded hover:bg-success/10 hover:text-success"
                      onClick={handleAddField}
                      disabled={isProcessing || !newField.trim()}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded"
                      onClick={() => {
                        setIsAdding(false);
                        setNewField('');
                        setNewValue('');
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {entries.map(([field, value]) => (
              <TableRow
                key={field}
                className={cn(
                  "group transition-colors",
                  editing?.field === field && "bg-primary/5"
                )}
              >
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3 text-primary/40 shrink-0" />
                    {editing?.field === field ? (
                      <Input
                        value={editing.field}
                        onChange={(e) =>
                          setEditing({ ...editing, field: e.target.value })
                        }
                        className="h-8 font-mono text-sm bg-background"
                      />
                    ) : (
                      <span className="truncate">{field}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {editing?.field === field ? (
                    <Input
                      value={editing.value}
                      onChange={(e) =>
                        setEditing({ ...editing, value: e.target.value })
                      }
                      className="h-8 font-mono text-sm bg-background"
                    />
                  ) : (
                    <span className="truncate block">{value}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editing?.field === field ? (
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
                        onClick={() => handleStartEdit(field, value)}
                        disabled={isAdding || editing !== null}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(field)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                  <Hash className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">暂无字段</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}