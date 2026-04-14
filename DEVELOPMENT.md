# 开发指南

## 启动开发服务器

```bash
cd /Users/apple/Desktop/Scrape-Go
pnpm dev
```

开发服务器会在 `http://localhost:3000` 启动，浏览器会自动打开并加载扩展。

## 打开侧边栏的方法

### 方法 1：点击扩展图标
点击浏览器工具栏中的 Scrape-Go 图标

### 方法 2：使用快捷键
- Mac: `Cmd+Shift+Y`
- Windows/Linux: `Ctrl+Shift+Y`

### 方法 3：通过命令面板
1. Mac: `Cmd+Shift+A` 或 Windows/Linux: `Ctrl+Shift+A`
2. 搜索 "Side Panel" 或 "侧边栏"
3. 选择 "显示侧边栏"

## 访问选项页面

### 方法 1：右键点击扩展图标
右键点击 Scrape-Go 图标 → 选择 "选项"

### 方法 2：扩展管理页面
1. 访问 `chrome://extensions/`
2. 找到 Scrape-Go → 点击 "详细信息"
3. 点击 "扩展程序选项"

## 测试小红书采集

1. 访问小红书笔记页面，例如：`https://www.xiaohongshu.com/explore/64a...`
2. 页面右上角会出现 "采集" 按钮
3. 点击 "采集" 按钮
4. 在侧边栏中查看采集的数据

## 调试技巧

### 查看 Console 日志

**Background Script:**
1. 访问 `chrome://extensions/`
2. 找到 Scrape-Go → 点击 "详细信息"
3. 找到 "检查视图" → 点击 "service worker"

**Content Script:**
1. 在小红书页面上右键 → 选择 "检查"
2. 在 Console 中查看日志

**Side Panel / Options Page:**
1. 打开侧边栏或选项页面
2. 右键 → 选择 "检查"
3. 在 Console 中查看日志

### 重新加载扩展

**热重载：**
- 按 `o` + `Enter`（开发服务器终端）

**手动重新加载：**
- 访问 `chrome://extensions/`
- 找到 Scrape-Go → 点击刷新按钮

## 常见问题

### 侧边栏无法打开

1. **检查 Chrome 版本**
   - 需要 Chrome 114 或更高版本

2. **检查权限**
   - 访问 `chrome://extensions/`
   - 找到 Scrape-Go → 点击 "详细信息"
   - 确保 "侧边栏" 权限已启用

3. **检查 manifest.json**
   ```bash
   cat .output/chrome-mv3-dev/manifest.json
   ```

### 采集按钮不显示

1. **检查 content script 是否加载**
   - 在小红书页面的 Console 中查看是否有 "Scrape-Go content script loaded" 日志

2. **检查 URL 匹配**
   - 确保 URL 匹配 `*://*.xiaohongshu.com/*`

### 数据保存失败

1. **检查 storage 权限**
   - 确保在 manifest.json 中有 `storage` 权限

2. **查看错误日志**
   - 在 background service worker 的 Console 中查看错误

## 构建生产版本

```bash
# 构建
pnpm build

# 打包
pnpm zip
```

生成的 `.zip` 文件可以：
- 安装到 Chrome 商店
- 分发给其他用户
- 用于测试

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试 UI
pnpm test:ui

# 运行测试（单次）
pnpm test:run
```

## 代码风格

项目使用：
- **TypeScript** - 类型安全
- **ESLint** - 代码检查（如已配置）
- **Prettier** - 代码格式化（如已配置）

```bash
# 检查类型
pnpm compile

# 格式化代码
pnpm format  # 如果已配置
```
