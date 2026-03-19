import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Check, X, Search, ArrowUpDown, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SetEditorProps {
  members: string[];
  onAddMember: (member: string) => Promise<void>;
  onRemoveMember: (member: string) => Promise<void>;
}

type SortType = 'default' | 'alpha' | 'length';

export function SetEditor({ members, onAddMember, onRemoveMember }: SetEditorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('default');
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingMember, setDeletingMember] = useState<string | null>(null);

  const filteredAndSortedMembers = useMemo(() => {
    let result = [...members];

    // 搜索过滤
    if (searchQuery) {
      result = result.filter((m) =>
        m.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 排序
    switch (sortType) {
      case 'alpha':
        result.sort((a, b) => a.localeCompare(b));
        break;
      case 'length':
        result.sort((a, b) => a.length - b.length);
        break;
      default:
        break;
    }

    return result;
  }, [members, searchQuery, sortType]);

  const handleAdd = async () => {
    if (!newMember.trim()) return;
    setIsProcessing(true);
    try {
      await onAddMember(newMember.trim());
      setNewMember('');
      setIsAdding(false);
    } catch (error) {
      console.error('添加失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (member: string) => {
    setDeletingMember(member);
    setIsProcessing(true);
    try {
      await onRemoveMember(member);
    } catch (error) {
      console.error('删除失败:', error);
      setDeletingMember(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const cycleSort = () => {
    const sorts: SortType[] = ['default', 'alpha', 'length'];
    const currentIndex = sorts.indexOf(sortType);
    setSortType(sorts[(currentIndex + 1) % sorts.length]);
  };

  const getSortLabel = () => {
    switch (sortType) {
      case 'alpha':
        return '字母';
      case 'length':
        return '长度';
      default:
        return '默认';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Set 成员</h3>
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
          >
            <Plus className="h-3 w-3" />
            添加
          </Button>
        )}
      </div>

      {/* 搜索和排序 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索成员..."
            className="pl-8 h-8 text-sm bg-muted/30 border-transparent focus:border-primary/30"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-md text-xs gap-1 px-2.5"
          onClick={cycleSort}
        >
          <ArrowUpDown className="h-3 w-3" />
          {getSortLabel()}
        </Button>
      </div>

      {/* 添加新成员 */}
      {isAdding && (
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-dashed border-primary/30 animate-[scaleIn_0.15s_ease-out]">
          <Input
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            placeholder="输入新成员"
            className="flex-1 h-8 font-mono text-sm bg-background"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewMember('');
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
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* 成员卡片网格 */}
      {filteredAndSortedMembers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {filteredAndSortedMembers.map((member, index) => (
            <div
              key={member}
              className={cn(
                "group relative flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-150",
                "bg-card hover:border-primary/20 hover:shadow-sm",
                deletingMember === member && "opacity-50 scale-95"
              )}
            >
              <Hash className="h-3 w-3 text-primary/50 shrink-0" />
              <span className="flex-1 font-mono text-xs truncate" title={member}>
                {member}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                onClick={() => handleDelete(member)}
                disabled={isProcessing}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Hash className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {searchQuery ? '没有找到匹配的成员' : '暂无成员'}
          </p>
          {searchQuery && (
            <p className="text-xs mt-1 opacity-70">
              共 {members.length} 个成员
            </p>
          )}
        </div>
      )}

      {/* 搜索结果统计 */}
      {searchQuery && members.length !== filteredAndSortedMembers.length && filteredAndSortedMembers.length > 0 && (
        <div className="text-xs text-muted-foreground text-center py-1">
          显示 {filteredAndSortedMembers.length} / {members.length} 个成员
        </div>
      )}
    </div>
  );
}