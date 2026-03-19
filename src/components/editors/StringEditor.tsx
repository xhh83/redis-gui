import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Edit2, FileText } from 'lucide-react';

interface StringEditorProps {
  value: string;
  onSave: (value: string) => Promise<void>;
}

export function StringEditor({ value, onSave }: StringEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div className="p-4 space-y-4">
      {/* 标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">String 值</h3>
          <span className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground font-medium">
            {value.length} 字符
          </span>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-md text-xs gap-1"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3 w-3" />
            编辑
          </Button>
        )}
      </div>

      {/* 内容区域 */}
      <div className="relative">
        <Textarea
          value={isEditing ? editValue : value}
          onChange={(e) => setEditValue(e.target.value)}
          readOnly={!isEditing}
          className={`min-h-[300px] font-mono text-sm transition-colors ${
            isEditing
              ? 'bg-background border-primary/30 focus:border-primary/50'
              : 'bg-muted/30 border-transparent'
          }`}
          placeholder="输入值..."
        />
        {!isEditing && !value && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground pointer-events-none">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">空值</p>
          </div>
        )}
      </div>

      {/* 编辑操作按钮 */}
      {isEditing && (
        <div className="flex justify-end gap-2 animate-[slideIn_0.15s_ease-out]">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-md text-xs gap-1"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-3 w-3" />
            取消
          </Button>
          <Button
            size="sm"
            className="h-8 rounded-md text-xs gap-1"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-3 w-3" />
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      )}
    </div>
  );
}