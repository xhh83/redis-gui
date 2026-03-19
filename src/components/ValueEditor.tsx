import { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { redisService } from '@/services/redisService';
import { formatTTL } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, Pencil } from 'lucide-react';
import { StringEditor } from '@/components/editors/StringEditor';
import { HashEditor } from '@/components/editors/HashEditor';
import { ListEditor } from '@/components/editors/ListEditor';
import { SetEditor } from '@/components/editors/SetEditor';
import { ZSetEditor } from '@/components/editors/ZSetEditor';
import { RenameKeyModal } from '@/components/RenameKeyModal';

export function ValueEditor() {
  const {
    selectedKey,
    selectedKeyType,
    selectedKeyValue,
    selectedKeyTTL,
    isLoading,
    keys,
    deleteKey,
    renameKey,
    refreshSelectedKey,
  } = useDataStore();

  const [showRenameModal, setShowRenameModal] = useState(false);

  if (!selectedKey) return null;

  const handleDelete = async () => {
    if (confirm(`确定要删除键 "${selectedKey}" 吗？`)) {
      await deleteKey(selectedKey);
    }
  };

  const handleRename = async (newKey: string) => {
    const success = await renameKey(selectedKey, newKey);
    return success;
  };

  const renderEditor = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm">加载中...</span>
          </div>
        </div>
      );
    }

    if (!selectedKeyValue) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground text-sm">无法加载值</div>
        </div>
      );
    }

    switch (selectedKeyValue.type) {
      case 'string':
        return (
          <StringEditor
            value={selectedKeyValue.value}
            onSave={async (value) => {
              await redisService.setString(selectedKey, value);
              await refreshSelectedKey();
            }}
          />
        );

      case 'hash':
        return (
          <HashEditor
            fields={selectedKeyValue.fields}
            onSetField={async (field, value) => {
              await redisService.setHashField(selectedKey, field, value);
              await refreshSelectedKey();
            }}
            onDeleteField={async (field) => {
              await redisService.deleteHashField(selectedKey, field);
              await refreshSelectedKey();
            }}
          />
        );

      case 'list':
        return (
          <ListEditor
            items={selectedKeyValue.items}
            onSetItem={async (index, value) => {
              await redisService.setListItem(selectedKey, index, value);
              await refreshSelectedKey();
            }}
            onPush={async (value, direction) => {
              await redisService.pushList(selectedKey, value, direction);
              await refreshSelectedKey();
            }}
            onRemove={async (value) => {
              await redisService.removeListItem(selectedKey, 1, value);
              await refreshSelectedKey();
            }}
          />
        );

      case 'set':
        return (
          <SetEditor
            members={selectedKeyValue.members}
            onAddMember={async (member) => {
              await redisService.addSetMember(selectedKey, member);
              await refreshSelectedKey();
            }}
            onRemoveMember={async (member) => {
              await redisService.removeSetMember(selectedKey, member);
              await refreshSelectedKey();
            }}
          />
        );

      case 'zset':
        return (
          <ZSetEditor
            members={selectedKeyValue.members}
            onAddMember={async (member, score) => {
              await redisService.addZSetMember(selectedKey, member, score);
              await refreshSelectedKey();
            }}
            onRemoveMember={async (member) => {
              await redisService.removeZSetMember(selectedKey, member);
              await refreshSelectedKey();
            }}
            onUpdateScore={async (member, score) => {
              await redisService.updateZSetScore(selectedKey, member, score);
              await refreshSelectedKey();
            }}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground text-sm">未知类型</div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 标题栏 */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-sm truncate max-w-[400px] text-foreground/80" title={selectedKey}>
            {selectedKey}
          </span>
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold tracking-wide">
            {selectedKeyType?.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-md text-xs gap-1 text-muted-foreground"
            disabled
          >
            <Clock className="h-3 w-3" />
            {formatTTL(selectedKeyTTL)}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-md text-xs gap-1"
            onClick={() => setShowRenameModal(true)}
          >
            <Pencil className="h-3 w-3" />
            重命名
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 rounded-md text-xs gap-1"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
            删除
          </Button>
        </div>
      </div>

      {/* 值内容 */}
      <div className="flex-1 overflow-y-auto">
        {renderEditor()}
      </div>

      {/* 重命名弹窗 */}
      <RenameKeyModal
        open={showRenameModal}
        onOpenChange={setShowRenameModal}
        currentKey={selectedKey}
        onRename={handleRename}
        existingKeys={keys}
      />
    </div>
  );
}