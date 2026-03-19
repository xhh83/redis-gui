// Redis 连接配置类型
export interface ConnectionConfig {
  id: string;
  name: string;
  type: 'standalone' | 'cluster';
  // 单机模式
  host?: string;
  port?: number;
  // 集群模式
  nodes?: ClusterNode[];
  // 通用配置
  password?: string;
  username?: string;
  db?: number;
  tls?: boolean;
  // 元数据
  createdAt: number;
  updatedAt: number;
}

// 集群节点
export interface ClusterNode {
  host: string;
  port: number;
  password?: string;
}

// Redis 键信息
export interface RedisKey {
  key: string;
  type: RedisKeyType;
  ttl: number;
  size?: number;
}

// Redis 值类型
export type RedisKeyType =
  | 'string'
  | 'hash'
  | 'list'
  | 'set'
  | 'zset'
  | 'stream'
  | 'none';

// 键树节点
export interface KeyTreeNode {
  name: string;
  fullPath: string;
  isLeaf: boolean;
  children: KeyTreeNode[];
  keyType?: RedisKeyType;
}

// String 值
export interface StringValue {
  type: 'string';
  value: string;
}

// Hash 值
export interface HashValue {
  type: 'hash';
  fields: Record<string, string>;
}

// List 值
export interface ListValue {
  type: 'list';
  items: string[];
}

// Set 值
export interface SetValue {
  type: 'set';
  members: string[];
}

// ZSet 值
export interface ZSetValue {
  type: 'zset';
  members: Array<{ member: string; score: number }>;
}

// Redis 值联合类型
export type RedisValue =
  | StringValue
  | HashValue
  | ListValue
  | SetValue
  | ZSetValue;

// 连接状态
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

// 集群信息
export interface ClusterInfo {
  state: string;
  slots_assigned: number;
  slots_ok: number;
  slots_pfail: number;
  slots_fail: number;
  known_nodes: number;
  size: number;
}

// 集群节点信息
export interface ClusterNodeInfo {
  id: string;
  host: string;
  port: number;
  role: 'master' | 'slave';
  slots?: string;
  masterId?: string;
  linkState: string;
}