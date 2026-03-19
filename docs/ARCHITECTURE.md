# Redis GUI 架构文档

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron 应用                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              渲染进程 (Renderer)                      │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │           React + Next.js 应用               │    │   │
│  │  │                                             │    │   │
│  │  │  ┌───────────┐  ┌───────────┐  ┌─────────┐ │    │   │
│  │  │  │  Sidebar  │  │  KeyTree  │  │  Value  │ │    │   │
│  │  │  │ 连接列表   │  │  键树     │  │ Editor  │ │    │   │
│  │  │  └───────────┘  └───────────┘  └─────────┘ │    │   │
│  │  │                                             │    │   │
│  │  │  ┌─────────────────────────────────────┐   │    │   │
│  │  │  │         Zustand Stores              │   │    │   │
│  │  │  │  - connectionStore (连接状态)        │   │    │   │
│  │  │  │  - dataStore (数据状态)              │   │    │   │
│  │  │  └─────────────────────────────────────┘   │    │   │
│  │  │                                             │    │   │
│  │  │  ┌─────────────────────────────────────┐   │    │   │
│  │  │  │         redisService.ts             │   │    │   │
│  │  │  │  (IPC 调用封装)                      │   │    │   │
│  │  │  └─────────────────────────────────────┘   │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                        │                            │   │
│  │                        │ IPC (contextBridge)        │   │
│  │                        ▼                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              主进程 (Main Process)                    │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │           IPC Handlers                       │    │   │
│  │  │  - redis:connect/disconnect                  │    │   │
│  │  │  - redis:scanKeys, getType, getValue...      │    │   │
│  │  │  - connections:load/save                      │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                        │                            │   │
│  │                        │ ioredis                    │   │
│  │                        ▼                            │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │           Redis Client                       │    │   │
│  │  │  - 单机模式 (Redis)                          │    │   │
│  │  │  - 集群模式 (Cluster)                        │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │      Redis Server      │
              │  (单机 / 集群模式)      │
              └───────────────────────┘
```

## 技术选型

### 前端框架

| 技术 | 版本 | 用途 |
|------|------|------|
| Electron | 34.x | 桌面应用框架 |
| Next.js | 16.x | React 框架，静态导出 |
| React | 19.x | UI 组件库 |
| TypeScript | 5.x | 类型安全 |

### UI 组件

| 技术 | 版本 | 用途 |
|------|------|------|
| Tailwind CSS | 4.x | 原子化 CSS |
| Radix UI | 最新 | 无样式组件 |
| Lucide React | 0.475.x | 图标库 |
| Motion | 12.x | 动画库 |

### 状态管理

| 技术 | 版本 | 用途 |
|------|------|------|
| Zustand | 5.x | 轻量状态管理 |

### 数据层

| 技术 | 版本 | 用途 |
|------|------|------|
| ioredis | 5.x | Redis 客户端 |

## 数据流

### 连接流程

```
用户点击连接
    │
    ▼
ConnectionModal 收集配置
    │
    ▼
connectionStore.addConnection()
    │
    ├── 保存到 localStorage (通过 IPC)
    │
    ▼
connectionStore.selectConnection()
    │
    ├── 调用 redisService.connect()
    │       │
    │       ▼
    │   IPC: redis:connect
    │       │
    │       ▼
    │   主进程创建 Redis 客户端
    │       │
    │       ▼
    │   返回连接结果
    │
    ▼
更新 connectionStatus
```

### 数据操作流程

```
用户操作数据
    │
    ▼
UI 组件调用 Store 方法
    │
    ▼
Store 调用 redisService
    │
    ▼
redisService 调用 window.electronAPI
    │
    ▼
IPC 通信到主进程
    │
    ▼
主进程执行 ioredis 操作
    │
    ▼
返回结果到渲染进程
    │
    ▼
更新 Store 状态
    │
    ▼
UI 自动更新
```

## 目录结构详解

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
│
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── RedisClient.tsx   # 主应用布局
│   ├── Sidebar.tsx       # 左侧连接列表
│   ├── KeyTree.tsx       # 中间键树
│   ├── ValueEditor.tsx   # 右侧值编辑
│   └── ConnectionModal.tsx
│
├── stores/               # Zustand 状态管理
│   ├── connectionStore.ts
│   └── dataStore.ts
│
├── services/             # 服务层
│   └── redisService.ts   # Redis IPC 封装
│
├── types/                # TypeScript 类型
│   └── redis.ts
│
└── lib/                  # 工具函数
    └── utils.ts
```

## IPC API 设计

### 连接管理

```typescript
// 连接 Redis
ipcRenderer.invoke('redis:connect', config: ConnectionConfig)
  → Promise<{ success: boolean; error?: string }>

// 断开连接
ipcRenderer.invoke('redis:disconnect')
  → Promise<void>

// 加载保存的连接
ipcRenderer.invoke('connections:load')
  → Promise<ConnectionConfig[]>

// 保存连接配置
ipcRenderer.invoke('connections:save', connections: ConnectionConfig[])
  → Promise<void>
```

### 数据操作

```typescript
// 扫描键
ipcRenderer.invoke('redis:scanKeys', pattern: string, limit: number)
  → Promise<{ key: string; type: RedisKeyType }[]>

// 获取键类型
ipcRenderer.invoke('redis:getType', key: string)
  → Promise<RedisKeyType>

// 获取 TTL
ipcRenderer.invoke('redis:getTTL', key: string)
  → Promise<number>

// 获取值
ipcRenderer.invoke('redis:getValue', key: string)
  → Promise<RedisValue>

// 删除键
ipcRenderer.invoke('redis:deleteKey', key: string)
  → Promise<boolean>

// String 操作
ipcRenderer.invoke('redis:setString', key: string, value: string)
  → Promise<boolean>

// Hash 操作
ipcRenderer.invoke('redis:hset', key: string, field: string, value: string)
  → Promise<boolean>
ipcRenderer.invoke('redis:hdel', key: string, field: string)
  → Promise<boolean>

// List 操作
ipcRenderer.invoke('redis:lpush', key: string, value: string)
  → Promise<boolean>
ipcRenderer.invoke('redis:rpush', key: string, value: string)
  → Promise<boolean>

// Set 操作
ipcRenderer.invoke('redis:sadd', key: string, member: string)
  → Promise<boolean>
ipcRenderer.invoke('redis:srem', key: string, member: string)
  → Promise<boolean>

// ZSet 操作
ipcRenderer.invoke('redis:zadd', key: string, score: number, member: string)
  → Promise<boolean>
ipcRenderer.invoke('redis:zrem', key: string, member: string)
  → Promise<boolean>

// 其他操作
ipcRenderer.invoke('redis:expire', key: string, seconds: number)
  → Promise<boolean>
ipcRenderer.invoke('redis:rename', oldKey: string, newKey: string)
  → Promise<boolean>
ipcRenderer.invoke('redis:info')
  → Promise<string>
ipcRenderer.invoke('redis:dbsize')
  → Promise<number>
```

## 构建流程

```
pnpm build
    │
    ├── next build (构建 Next.js)
    │       │
    │       ▼
    │   生成静态文件到 out/
    │
    └── electron-builder (打包 Electron)
            │
            ▼
        生成 DMG/ZIP 到 dist/
```

## 安全考虑

1. **IPC 安全**: 使用 contextBridge 暴露有限的 API
2. **敏感数据**: 密码存储在 Electron userData 目录
3. **输入验证**: 所有用户输入在主进程验证
4. **错误处理**: 不泄露敏感错误信息到前端