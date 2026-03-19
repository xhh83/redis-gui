# Redis GUI 开发计划

## 项目概述

开发一个基于 macOS 的 Redis GUI 应用，支持单机和集群模式连接，提供简洁的数据操作界面。

### 需求

- 连接管理：支持 Redis 单机和集群模式
- 数据浏览：键树展示，层级结构
- 数据操作：String、Hash、List、Set、ZSet 类型的 CRUD
- UI 设计：简洁现代，参照 Codex 桌面版风格
- 主语言：TypeScript

---

## 开发阶段

### 阶段 1: 项目初始化 ✅

- [x] 创建 Electron + Next.js 项目
- [x] 配置 TypeScript
- [x] 配置 Tailwind CSS 4
- [x] 配置 ESLint

### 阶段 2: 基础架构 ✅

- [x] 创建 Electron 主进程入口
- [x] 创建 preload 脚本
- [x] 定义 IPC 通信接口
- [x] 创建类型定义文件

### 阶段 3: Redis 连接模块 ✅

- [x] 实现 Redis 客户端初始化
- [x] 实现单机模式连接
- [x] 实现集群模式连接
- [x] 实现连接配置持久化
- [x] 实现连接测试功能

### 阶段 4: 数据浏览功能 ✅

- [x] 实现键扫描 (SCAN)
- [x] 实现键树组件
- [x] 实现键类型识别
- [x] 实现键搜索过滤

### 阶段 5: 数据操作功能 ✅

- [x] String 类型操作 (GET/SET/DEL)
- [x] Hash 类型操作 (HGET/HSET/HDEL)
- [x] List 类型操作 (LPUSH/RPUSH/LPOP/RPOP)
- [x] Set 类型操作 (SADD/SREM/SMEMBERS)
- [x] ZSet 类型操作 (ZADD/ZREM/ZRANGE)
- [x] TTL 管理
- [x] 键重命名

### 阶段 6: UI 组件开发 ✅

- [x] 创建基础 UI 组件库 (基于 Radix UI)
  - [x] Button
  - [x] Input
  - [x] Dialog
  - [x] Tabs
  - [x] Table
  - [x] ScrollArea
  - [x] Tooltip
  - [x] DropdownMenu
- [x] 创建 Sidebar 组件
- [x] 创建 KeyTree 组件
- [x] 创建 ValueEditor 组件
- [x] 创建 ConnectionModal 组件

### 阶段 7: UI 优化与打包 ✅

- [x] 优化 UI 布局和样式
- [x] 配置 Electron Builder
- [x] 测试开发模式运行

---

## 技术栈对比（与 CodePilot 项目）

| 功能 | CodePilot | Redis GUI | 一致性 |
|------|-----------|-----------|--------|
| 桌面框架 | Electron | Electron | ✅ |
| 前端框架 | Next.js | Next.js | ✅ |
| UI 库 | React | React | ✅ |
| 语言 | TypeScript | TypeScript | ✅ |
| CSS 方案 | Tailwind CSS | Tailwind CSS 4 | ✅ |
| 组件库 | Radix UI | Radix UI | ✅ |
| 状态管理 | Zustand | Zustand | ✅ |
| 图标库 | Lucide | Lucide | ✅ |

**结论**: 技术栈完全一致，符合项目要求。

---

## 未来计划

### 功能增强

- [ ] 控制台/命令行模式
- [ ] 数据导入/导出
- [ ] 键值搜索增强
- [ ] 性能监控面板
- [ ] 多语言支持

### 用户体验

- [ ] 深色模式
- [ ] 快捷键支持
- [ ] 拖拽操作
- [ ] 历史记录

### 技术优化

- [ ] 单元测试覆盖
- [ ] E2E 测试
- [ ] 性能优化
- [ ] 错误边界处理

---

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

---

## 注意事项

1. **ioredis 限制**: 只能在 Node.js 环境运行，需通过 IPC 通信
2. **静态导出**: Next.js 需配置静态导出供 Electron 加载
3. **开发模式**: Next.js 开发服务器需先启动，Electron 再连接
4. **打包配置**: 确保包含 `out/` 目录和 `main/` 目录

---

## 更新日志

### 2026-03-18

- 完成项目初始化
- 完成 Redis 连接模块
- 完成数据浏览功能
- 完成数据操作功能
- 完成 UI 组件开发
- 完成 UI 优化与打包配置
- 应用成功运行