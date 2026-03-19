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
import { Plus, Trash2, Edit2, Check, X, Hash, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZSetMember {
  member: string;
  score: number;
}

interface ZSetEditorProps {
  members: ZSetMember[];
  onAddMember: (member: string, score: number) => Promise<void>;
  onRemoveMember: (member: string) => Promise<void>;
  onUpdateScore: (member: string, score: number) => Promise<void>;
}

interface EditingState {
  member: string;
  score: number;
  isNew: boolean;
}

export function ZSetEditor({ members, onAddMember, onRemoveMember, onUpdateScore }: ZSetEditorProps) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState('');
  const [newScore, setNewScore] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartEdit = (member: string, score: number) => {
    setEditing({ member, score, isNew: false });
  };

  const handleCancelEdit = () => {
    setEditing(null);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setIsProcessing(true);
    try {
      if (editing.isNew) {
        await onAddMember(editing.member, editing.score);
      } else {
        await onUpdateScore(editing.member, editing.score);
      }
      setEditing(null);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdd = async () => {
    if (!newMember.trim()) return;
    const score = parseFloat(newScore) || 0;
    setIsProcessing(true);
    try {
      await onAddMember(newMember.trim(), score);
      setNewMember('');
      setNewScore('0');
      setIsAdding(false);
    } catch (error) {
      console.error('添加失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (member: string) => {
    if (!confirm(`确定要删除成员 "${member}" 吗？`)) return;
    setIsProcessing(true);
    try {
      await onRemoveMember(member);
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
          <h3 className="text-sm font-semibold text-foreground">ZSet 成员</h3>
          <span className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground font-medium">
            {members.length}
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
            添加成员
          </Button>
        )}
      </div>

      {/* 添加新成员 */}
      {isAdding && (
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-dashed border-primary/30 animate-[scaleIn_0.15s_ease-out]">
          <div className="flex items-center gap-1.5 w-24">
            <TrendingUp className="h-3.5 w-3.5 text-primary/50" />
            <Input
              type="number"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              placeholder="分数"
              className="h-8 text-sm bg-background"
            />
          </div>
          <Input
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            placeholder="成员值"
            className="flex-1 h-8 font-mono text-sm bg-background"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewMember('');
                setNewScore('0');
              }
            }}
          />
          <Button
            size="sm"
            className="h-8 rounded-md gap-1"
            onClick={handleAdd}
            disabled={isProcessing || !newMember.trim()}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-md"
            onClick={() => {
              setIsAdding(false);
              setNewMember('');
              setNewScore('0');
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
              <TableHead className="w-28 text-xs font-medium text-muted-foreground">Score</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Member</TableHead>
              <TableHead className="w-24 text-right text-xs font-medium text-muted-foreground">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((item) => (
              <TableRow
                key={item.member}
                className={cn(
                  "group transition-colors",
                  editing?.member === item.member && "bg-primary/5"
                )}
              >
                <TableCell>
                  {editing?.member === item.member ? (
                    <Input
                      type="number"
                      value={editing.score}
                      onChange={(e) =>
                        setEditing({ ...editing, score: parseFloat(e.target.value) || 0 })
                      }
                      className="h-8 w-20 text-sm bg-background"
                      step="0.1"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-primary/50" />
                      <span className="text-primary font-semibold text-sm">{item.score}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                    {editing?.member === item.member ? (
                      <Input
                        value={editing.member}
                        onChange={(e) =>
                          setEditing({ ...editing, member: e.target.value })
                        }
                        className="h-8 font-mono text-sm bg-background"
                      />
                    ) : (
                      <span className="truncate">{item.member}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {editing?.member === item.member ? (
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
                        onClick={() => handleStartEdit(item.member, item.score)}
                        disabled={isAdding || editing !== null}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(item.member)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">暂无成员</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}