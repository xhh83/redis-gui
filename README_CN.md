# Redis GUI

一款现代、优雅的 macOS Redis 图形化客户端，基于 Electron、Next.js 和 Tailwind CSS 构建。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)

## 功能特性

- **现代化界面** - 简洁优雅的界面设计，支持深色/浅色模式
- **多种连接模式** - 支持单机和集群两种连接模式
- **完整数据类型支持** - String、Hash、List、Set、ZSet
- **键管理** - 浏览、搜索、创建、重命名和删除键
- **TTL 支持** - 设置和查看键的过期时间
- **连接管理** - 保存和管理多个 Redis 连接配置
- **集群支持** - 完整的 Redis 集群兼容性

## 截图

即将推出...

## 安装

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 开发模式

```bash
# 克隆仓库
git clone https://github.com/yourusername/redis-gui.git
cd redis-gui

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 构建 macOS 应用
npm run build
```

构建完成的应用程序将位于 `dist` 目录中。

## 使用指南

### 添加连接

1. 点击侧边栏的 **+** 按钮
2. 选择 **单机** 或 **集群** 模式
3. 输入连接信息：
   - 名称（可选）
   - 主机和端口
   - 密码（如有）
   - 数据库编号（单机模式）
4. 点击 **测试连接** 进行验证
5. 点击 **保存** 添加连接

### 浏览键

- 点击连接即可连接到 Redis
- 键以树形结构展示，基于分隔符（`:`）组织
- 使用搜索框过滤键
- 点击键查看其值

### 编辑值

- **String**：直接在文本框中编辑
- **Hash**：添加、编辑或删除字段
- **List**：添加、编辑或删除元素
- **Set**：添加或删除成员（卡片式展示）
- **ZSet**：添加、编辑或删除带分数的成员

### 键操作

- **新增键**：点击键面板的 + 按钮
- **重命名**：右键菜单或使用重命名按钮
- **删除**：右键菜单或使用删除按钮
- **设置 TTL**：创建或编辑键时配置过期时间

## 技术栈

- **前端**：Next.js 16、React 19、TypeScript
- **桌面端**：Electron 34
- **样式**：Tailwind CSS 4、shadcn/ui
- **状态管理**：Zustand
- **Redis 客户端**：ioredis

## 项目结构

```
redis-gui/
├── main/                 # Electron 主进程
├── src/
│   ├── app/              # Next.js 应用路由
│   ├── components/       # React 组件
│   │   ├── editors/      # 数据类型编辑器
│   │   └── ui/           # UI 组件 (shadcn)
│   ├── lib/              # 工具函数
│   ├── services/         # Redis 服务层
│   ├── stores/           # Zustand 状态仓库
│   └── types/            # TypeScript 类型定义
├── public/               # 静态资源
└── package.json
```

## 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run lint         # 运行 ESLint
npm run type-check   # TypeScript 类型检查
```

## 参与贡献

欢迎贡献代码！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 许可证

本项目基于 MIT 许可证开源 - 详情请查看 [LICENSE](LICENSE) 文件。

## 致谢

- [shadcn/ui](https://ui.shadcn.com/) - 精美的 UI 组件库
- [ioredis](https://github.com/luin/ioredis) - 强大的 Redis 客户端
- [Lucide](https://lucide.dev/) - 优雅的图标库