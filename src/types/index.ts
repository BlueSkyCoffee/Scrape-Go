// 小红书笔记数据接口
export interface XiaohongshuNote {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    link?: string;
  };
  images: string[];
  likes: number;
  collects: number;
  comments: number;
  tags?: string[];
  publishTime?: string;
  url: string;
  timestamp: number;
}

// 采集平台类型
export type Platform = 'xiaohongshu' | 'other';

// 通用采集数据接口
export interface ScrapedData {
  platform: Platform;
  url: string;
  timestamp: number;
  data: XiaohongshuNote | any;
}

// 采集状态
export interface ScrapingStatus {
  isScraping: boolean;
  currentUrl: string | null;
  progress: number;
  error: string | null;
}

// 插件设置
export interface Settings {
  autoScrape: boolean;
  saveImages: boolean;
  notifications: boolean;
  maxConcurrent: number;
}
