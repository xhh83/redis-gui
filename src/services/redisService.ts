// Redis 服务 - 通过 IPC 与主进程通信
import type {
  ConnectionConfig,
  RedisKeyType,
  RedisValue,
} from '@/types/redis';

// 声明 electronAPI 类型
declare global {
  interface Window {
    electronAPI: {
      platform: string;
      loadConnections: () => Promise<ConnectionConfig[]>;
      saveConnections: (connections: ConnectionConfig[]) => Promise<{ success: boolean }>;
      connect: (config: ConnectionConfig) => Promise<{ success: boolean; error?: string }>;
      disconnect: () => Promise<{ success: boolean }>;
      scanKeys: (pattern: string, limit: number) => Promise<{ keys?: string[]; error?: string }>;
      getType: (key: string) => Promise<{ type?: string; error?: string }>;
      getTTL: (key: string) => Promise<{ ttl?: number; error?: string }>;
      getValue: (key: string) => Promise<{ type?: string; value?: unknown; error?: string }>;
      deleteKey: (key: string) => Promise<{ success?: boolean; error?: string }>;
      rename: (oldKey: string, newKey: string) => Promise<{ success?: boolean; error?: string }>;
      expire: (key: string, ttl: number) => Promise<{ success?: boolean; error?: string }>;
      setString: (key: string, value: string, ttl?: number) => Promise<{ success?: boolean; error?: string }>;
      hset: (key: string, field: string, value: string) => Promise<{ success?: boolean; error?: string }>;
      hdel: (key: string, field: string) => Promise<{ success?: boolean; error?: string }>;
      lpush: (key: string, value: string) => Promise<{ success?: boolean; error?: string }>;
      rpush: (key: string, value: string) => Promise<{ success?: boolean; error?: string }>;
      lset: (key: string, index: number, value: string) => Promise<{ success?: boolean; error?: string }>;
      lrem: (key: string, count: number, value: string) => Promise<{ success?: boolean; error?: string }>;
      sadd: (key: string, member: string) => Promise<{ success?: boolean; error?: string }>;
      srem: (key: string, member: string) => Promise<{ success?: boolean; error?: string }>;
      zadd: (key: string, member: string, score: number) => Promise<{ success?: boolean; error?: string }>;
      zrem: (key: string, member: string) => Promise<{ success?: boolean; error?: string }>;
      zaddUpdate: (key: string, member: string, score: number) => Promise<{ success?: boolean; error?: string }>;
      info: (section?: string) => Promise<{ info?: string; error?: string }>;
      dbsize: () => Promise<{ size?: number; error?: string }>;
    };
  }
}

export class RedisService {
  private connected: boolean = false;

  // 连接 Redis
  async connect(config: ConnectionConfig): Promise<{ success: boolean; error?: string }> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      return { success: false, error: 'Electron API 不可用' };
    }

    const result = await window.electronAPI.connect(config);
    this.connected = result.success;
    return result;
  }

  // 断开连接
  async disconnect(): Promise<void> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      await window.electronAPI.disconnect();
    }
    this.connected = false;
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.connected;
  }

  // 获取键类型
  async getKeyType(key: string): Promise<RedisKeyType> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.getType(key);
    if (result.error) throw new Error(result.error);
    return (result.type || 'none') as RedisKeyType;
  }

  // 获取键 TTL
  async getTTL(key: string): Promise<number> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.getTTL(key);
    if (result.error) throw new Error(result.error);
    return result.ttl ?? -1;
  }

  // 扫描键
  async scanKeys(pattern: string = '*', limit: number = 1000): Promise<string[]> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.scanKeys(pattern, limit);
    if (result.error) throw new Error(result.error);
    return result.keys || [];
  }

  // 获取所有键
  async getAllKeys(pattern: string = '*', limit: number = 1000): Promise<string[]> {
    return this.scanKeys(pattern, limit);
  }

  // 删除键
  async deleteKey(key: string): Promise<boolean> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.deleteKey(key);
    return result.success ?? false;
  }

  // 重命名键
  async renameKey(oldKey: string, newKey: string): Promise<boolean> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.rename(oldKey, newKey);
    return result.success ?? false;
  }

  // 设置 TTL
  async setTTL(key: string, ttl: number): Promise<boolean> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.expire(key, ttl);
    return result.success ?? false;
  }

  // 获取值
  async getValue(key: string): Promise<RedisValue | null> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.getValue(key);
    if (result.error) throw new Error(result.error);

    const type = result.type;
    const value = result.value;

    if (!type || type === 'none' || value === null || value === undefined) {
      return null;
    }

    switch (type) {
      case 'string':
        return { type: 'string', value: String(value) };
      case 'hash':
        return { type: 'hash', fields: value as Record<string, string> };
      case 'list':
        return { type: 'list', items: value as string[] };
      case 'set':
        return { type: 'set', members: value as string[] };
      case 'zset':
        return { type: 'zset', members: value as Array<{ member: string; score: number }> };
      default:
        return null;
    }
  }

  // String 操作
  async setString(key: string, value: string, ttl?: number): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.setString(key, value, ttl);
    if (result.error) throw new Error(result.error);
  }

  // Hash 操作
  async setHashField(key: string, field: string, value: string): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.hset(key, field, value);
    if (result.error) throw new Error(result.error);
  }

  async deleteHashField(key: string, field: string): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.hdel(key, field);
    if (result.error) throw new Error(result.error);
  }

  // List 操作
  async pushList(key: string, value: string, direction: 'left' | 'right' = 'right'): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = direction === 'left'
      ? await window.electronAPI.lpush(key, value)
      : await window.electronAPI.rpush(key, value);
    if (result.error) throw new Error(result.error);
  }

  async setListItem(key: string, index: number, value: string): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.lset(key, index, value);
    if (result.error) throw new Error(result.error);
  }

  async removeListItem(key: string, count: number, value: string): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.lrem(key, count, value);
    if (result.error) throw new Error(result.error);
  }

  // Set 操作
  async addSetMember(key: string, member: string): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.sadd(key, member);
    if (result.error) throw new Error(result.error);
  }

  async removeSetMember(key: string, member: string): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.srem(key, member);
    if (result.error) throw new Error(result.error);
  }

  // ZSet 操作
  async addZSetMember(key: string, member: string, score: number): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.zadd(key, member, score);
    if (result.error) throw new Error(result.error);
  }

  async removeZSetMember(key: string, member: string): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.zrem(key, member);
    if (result.error) throw new Error(result.error);
  }

  async updateZSetScore(key: string, member: string, score: number): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.zadd(key, member, score);
    if (result.error) throw new Error(result.error);
  }

  // 新建键
  async createKey(
    key: string,
    type: RedisKeyType,
    value: RedisValue,
    ttl?: number
  ): Promise<void> {
    switch (type) {
      case 'string':
        await this.setString(key, (value as { value: string }).value, ttl);
        break;
      default:
        throw new Error(`暂不支持创建 ${type} 类型的键`);
    }
  }

  // 获取数据库大小
  async getDbSize(): Promise<number> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.dbsize();
    if (result.error) throw new Error(result.error);
    return result.size ?? 0;
  }

  // 获取信息
  async getInfo(section?: string): Promise<string> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('Electron API 不可用');
    }

    const result = await window.electronAPI.info(section);
    if (result.error) throw new Error(result.error);
    return result.info ?? '';
  }
}

// 单例导出
export const redisService = new RedisService();