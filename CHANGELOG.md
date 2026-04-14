# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-14

### Added

- 初始版本发布
- 小红书数据采集功能
- 侧边栏界面
- 选项页面（设置、帮助、关于）
- 数据导出功能（JSON 格式）
- shadcn/ui 组件库集成
- Tailwind CSS 样式
- TypeScript 支持
- Vitest 测试框架
- 自动采集按钮注入到小红书页面
- 基本设置选项：
  - 自动采集开关
  - 保存图片开关
  - 显示通知开关
  - 最大并发数配置

### Features

- 从小红书笔记页面提取：
  - 标题
  - 内容
  - 作者信息
  - 图片
  - 点赞数
  - 收藏数
  - 评论数

### Technical

- WXT 框架集成
- React 19
- Content Script 注入
- Background Service Worker
- 本地存储（browser.storage.local）
- 消息传递机制

## [Unreleased]

### Planned

- 支持更多社交媒体平台
- 图片下载功能
- 数据去重
- 批量采集
- 云端同步
- 更多导出格式（CSV、Excel）
- 数据统计和分析
