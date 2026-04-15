# 主题切换功能实现说明

## 已完成的工作

### 1. CSS 变量配置 ✅
- `src/index.css` 中已完整定义 `:root`（浅色）和 `.dark`（深色）的 CSS 变量
- 使用 shadcn/ui 推荐的 HSL 色彩空间
- 包含完整的主题变量（background, foreground, card, primary, secondary, muted, accent, destructive, border, input, ring 等）

### 2. 主题切换 Hook ✅
- 创建了 `src/hooks/useTheme.ts`
- 功能：
  - 从 `browser.storage.local` 读取用户主题偏好
  - 如果没有保存的偏好，自动检测系统主题偏好（`prefers-color-scheme`）
  - 提供 `theme`、`setTheme`、`toggleTheme` 和 `mounted` 状态
  - 通过添加/移除 `.dark` 类到根元素来应用主题
  - 自动保存用户偏好到 `browser.storage.local`
- 防止水合不匹配（hydration mismatch）

### 3. 主题切换组件 ✅
- 创建了 `src/components/ThemeSwitcher.tsx`
- 使用 `Button` 组件（variant="ghost", size="icon"）
- 使用 Lucide React 图标：
  - 浅色模式：显示 Moon 图标
  - 深色模式：显示 Sun 图标
- 无 emoji，纯图标实现
- 包含可访问性标签（aria-label）
- 支持过渡动画效果

### 4. 集成到页面 ✅
- **Options 页面**：在页面右上角添加了主题切换按钮
- **Sidepanel 页面**：在页面右上角添加了主题切换按钮（与设置按钮并排显示）
- 两个页面都能独立控制主题，并通过 `browser.storage.local` 同步状态

### 5. 构建验证 ✅
- 运行 `pnpm build` 成功
- 生成文件包括：
  - `chunks/Theme` 主题切换相关代码
  - `assets/ThemeSwitcher` 样式文件
  - 所有页面正确打包

## 使用方式

1. **测试主题切换**：
   ```bash
   pnpm dev
   ```
   或加载 `.output/chrome-mv3` 目录到浏览器扩展

2. **切换主题**：
   - 点击右上角的 Sun/Moon 图标按钮
   - 主题会立即切换，偏好会自动保存

3. **验证持久化**：
   - 关闭并重新打开扩展
   - 主题设置应该保持上次选择的状态

4. **系统主题偏好**：
   - 首次使用时，会自动跟随系统主题（明/暗模式）

## 技术细节

### 状态同步
- 使用 `browser.storage.local` 存储主题偏好
- 存储键：`theme`
- 存储值：`'light'` 或 `'dark'`

### 主题应用方式
- 浅色模式：移除根元素的 `.dark` 类
- 深色模式：添加根元素的 `.dark` 类
- Tailwind CSS 会根据 `.dark` 类自动应用对应的 CSS 变量

### 防水合不匹配
- `useTheme` Hook 提供 `mounted` 状态
- `ThemeSwitcher` 组件在 `mounted` 为 `false` 时显示禁用状态
- 确保服务端渲染和客户端渲染一致

## 文件清单

### 新增文件
- `src/hooks/useTheme.ts` - 主题管理 Hook
- `src/components/ThemeSwitcher.tsx` - 主题切换组件

### 修改文件
- `src/entrypoints/options/App.tsx` - 添加主题切换按钮
- `src/entrypoints/sidepanel/App.tsx` - 添加主题切换按钮

### 已有文件（无需修改）
- `src/index.css` - CSS 变量已完整配置

## 后续建议

1. **添加主题切换动画**（可选）：
   - 可以为主题切换添加平滑过渡效果
   - 在 CSS 中添加 `transition` 属性

2. **添加键盘快捷键**（可选）：
   - 例如：Cmd/Ctrl + Shift D 切换主题

3. **添加主题预览**（可选）：
   - 在设置页面添加主题预览区域

4. **添加更多主题**（可选）：
   - 如果需要，可以扩展支持更多主题方案

## 测试检查清单

- [ ] 点击主题切换按钮，主题能够正确切换
- [ ] 刷新页面后，主题设置保持不变
- [ ] 关闭扩展后重新打开，主题设置保持不变
- [ ] Options 页面和 Sidepanel 页面的主题状态同步
- [ ] 浅色模式下所有组件显示正常
- [ ] 深色模式下所有组件显示正常
- [ ] 图标正确显示（Sun/Moon）
- [ ] 无控制台错误或警告
- [ ] 首次使用时，自动检测系统主题偏好
