# Scrape-Go

一个强大的浏览器插件，用于自动采集社交媒体和电商网站的数据。

## 功能特性

- 🎯 **多平台支持**：支持小红书等社交媒体平台
- 📊 **数据采集**：自动提取笔记标题、内容、作者、图片、点赞、收藏、评论等信息
- 🎨 **美观界面**：基于 shadcn/ui 构建的现代化 UI
- ⚡ **侧边栏集成**：直接在浏览器侧边栏中查看和管理采集的数据
- 💾 **数据导出**：支持将采集的数据导出为 JSON 格式
- 🔧 **灵活配置**：提供丰富的设置选项

## 技术栈

- **框架**：WXT - 现代化的浏览器扩展开发框架
- **UI**：React + shadcn/ui
- **样式**：Tailwind CSS
- **语言**：TypeScript
- **测试**：Vitest
- **包管理**：pnpm

## 安装

### 前置要求

- Node.js >= 18
- pnpm >= 8

### 克隆项目

```bash
cd /Users/apple/Desktop/Scrape-Go
```

### 安装依赖

```bash
pnpm install
```

## 开发

### 启动开发服务器

```bash
pnpm dev
```

这将：
1. 启动开发服务器
2. 构建扩展
3. 自动打开浏览器并加载扩展

### 构建生产版本

```bash
pnpm build
```

### 打包扩展

```bash
pnpm zip
```

## 测试

### 运行测试

```bash
pnpm test
```

### 运行测试 UI

```bash
pnpm test:ui
```

## 项目结构

```
Scrape-Go/
├── src/
│   ├── entrypoints/
│   │   ├── background.ts      # 后台服务
│   │   ├── content/           # 内容脚本
│   │   │   └── index.ts
│   │   ├── sidepanel/         # 侧边栏页面
│   │   │   ├── index.html
│   │   │   ├── main.tsx
│   │   │   └── App.tsx
│   │   └── options/           # 选项页面
│   │       ├── index.html
│   │       ├── main.tsx
│   │       └── App.tsx
│   ├── components/
│   │   └── ui/                # shadcn/ui 组件
│   ├── scrapers/              # 数据采集器
│   │   ├── xiaohongshu.ts
│   │   └── index.ts
│   ├── types/                 # TypeScript 类型定义
│   │   └── index.ts
│   ├── lib/                   # 工具函数
│   │   └── utils.ts
│   └── index.css              # 全局样式
├── tests/                     # 测试文件
│   ├── setup.ts
│   ├── scrapers/
│   └── types/
├── public/                    # 静态资源
├── components.json            # shadcn/ui 配置
├── tailwind.config.ts         # Tailwind CSS 配置
├── vitest.config.ts           # Vitest 配置
└── wxt.config.ts              # WXT 配置
```

## 使用方法

### 1. 侧边栏

在浏览器中打开侧边栏，点击 "Scrape-Go" 图标即可打开插件界面。

### 2. 采集数据

1. 访问小红书笔记页面
2. 点击页面右上角的"采集"按钮，或在侧边栏中点击"采集当前页面"
3. 等待采集完成
4. 数据将显示在侧边栏中

### 3. 导出数据

在侧边栏中点击"导出数据"按钮，将采集的数据导出为 JSON 文件。

### 4. 设置

在侧边栏中点击齿轮图标打开设置页面，可以配置：

- 自动采集
- 保存图片
- 显示通知
- 最大并发数

## 支持的平台

- ✅ 小红书 (xiaohongshu.com)
- 🚧 更多平台正在开发中...

## 开发指南

### 添加新的采集器

1. 在 `src/scrapers/` 目录下创建新的采集器文件
2. 实现采集逻辑
3. 在 `src/entrypoints/content/index.ts` 中添加相应的匹配规则
4. 更新 manifest

### 添加新的 UI 组件

```bash
pnpm dlx shadcn@latest add <component-name> --cwd . --path src/components/ui
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

## 致谢

- [WXT](https://wxt.dev/) - 浏览器扩展开发框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [React](https://react.dev/) - UI 库
