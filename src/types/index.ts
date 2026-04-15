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
export type Platform = 'xiaohongshu' | 'douyin' | 'kuaishou' | 'bilibili' | 'weibo' | 'taobao';

// 采集数据类型
export type ScrapedDataType = 'title' | 'content' | 'images' | 'videos' | 'comments';

// 通用采集数据接口
export interface ScrapedData {
  id: string;
  platform: Platform;
  url: string;
  timestamp: number;
  data: XiaohongshuNote | Record<string, unknown>;
  dataTypes: ScrapedDataType[];
}

// 采集状态
export interface ScrapingStatus {
  isScraping: boolean;
  currentUrl: string | null;
  progress: number;
  error: string | null;
}

// 采集设置
export interface ScrapingSettings {
  autoScrape: boolean;
  scrapeSources: Platform[];
  maxConcurrent: number;
  delay: number;
  dataTypes: ScrapedDataType[];
}

// 存储设置
export interface StorageSettings {
  saveImages: boolean;
  saveVideos: boolean;
  storagePath: string;
  exportFormat: 'json' | 'csv' | 'excel';
  autoBackup: boolean;
  maxStorageSize: number;
  autoCleanup: boolean;
  cleanupDays: number;
}

// 通知设置
export interface NotificationSettings {
  notifyOnComplete: boolean;
  notifyOnError: boolean;
  desktopNotifications: boolean;
  notificationSound: boolean;
}

// 数据统计
export interface DataStats {
  totalItems: number;
  totalImages: number;
  totalVideos: number;
  storageUsed: number;
  lastUpdated: number;
}

// 完整设置
export interface Settings {
  scraping: ScrapingSettings;
  storage: StorageSettings;
  notifications: NotificationSettings;
}

// 默认设置
export const defaultSettings: Settings = {
  scraping: {
    autoScrape: false,
    scrapeSources: ['xiaohongshu'],
    maxConcurrent: 3,
    delay: 1000,
    dataTypes: ['title', 'content', 'images'],
  },
  storage: {
    saveImages: true,
    saveVideos: true,
    storagePath: 'scrape-go-data',
    exportFormat: 'json',
    autoBackup: false,
    maxStorageSize: 1000,
    autoCleanup: false,
    cleanupDays: 30,
  },
  notifications: {
    notifyOnComplete: true,
    notifyOnError: true,
    desktopNotifications: true,
    notificationSound: true,
  },
};

// 默认数据统计
export const defaultDataStats: DataStats = {
  totalItems: 0,
  totalImages: 0,
  totalVideos: 0,
  storageUsed: 0,
  lastUpdated: Date.now(),
};