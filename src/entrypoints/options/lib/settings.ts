import { Settings, DataStats, defaultSettings, defaultDataStats } from '@/types';

const SETTINGS_KEY = 'settings';
const DATA_STATS_KEY = 'dataStats';
const SCRAPED_DATA_KEY = 'scrapedData';

// 设置管理
export async function loadSettings(): Promise<Settings> {
  try {
    const result = await browser.storage.local.get(SETTINGS_KEY);
    if (result[SETTINGS_KEY]) {
      // 合并默认设置，确保新字段有值
      return { ...defaultSettings, ...result[SETTINGS_KEY] };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return defaultSettings;
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await browser.storage.local.set({ [SETTINGS_KEY]: settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// 数据统计管理
export async function loadDataStats(): Promise<DataStats> {
  try {
    const result = await browser.storage.local.get(DATA_STATS_KEY);
    if (result[DATA_STATS_KEY]) {
      return { ...defaultDataStats, ...result[DATA_STATS_KEY] };
    }
  } catch (error) {
    console.error('Error loading data stats:', error);
  }
  return defaultDataStats;
}

export async function saveDataStats(stats: DataStats): Promise<void> {
  try {
    await browser.storage.local.set({ [DATA_STATS_KEY]: stats });
  } catch (error) {
    console.error('Error saving data stats:', error);
    throw error;
  }
}

// 采集数据管理
export async function loadScrapedData(): Promise<unknown[]> {
  try {
    const result = await browser.storage.local.get(SCRAPED_DATA_KEY);
    const data = result[SCRAPED_DATA_KEY];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading scraped data:', error);
    return [];
  }
}

export async function saveScrapedData(data: unknown[]): Promise<void> {
  try {
    await browser.storage.local.set({ [SCRAPED_DATA_KEY]: data });
  } catch (error) {
    console.error('Error saving scraped data:', error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await browser.storage.local.remove(SCRAPED_DATA_KEY);
    await browser.storage.local.set({ 
      [DATA_STATS_KEY]: defaultDataStats 
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

// 导出数据
export async function exportData(format: 'json' | 'csv' | 'excel'): Promise<string> {
  const data = await loadScrapedData();
  
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'csv':
      if (data.length === 0) return '';
      const headers = Object.keys(data[0] as Record<string, unknown>).join(',');
      const rows = data.map((item) => 
        Object.values(item as Record<string, unknown>)
          .map((value) => {
            const str = String(value);
            return str.includes(',') || str.includes('"') 
              ? `"${str.replace(/"/g, '""')}"` 
              : str;
          })
          .join(',')
      );
      return [headers, ...rows].join('\n');
    case 'excel':
      // Excel 格式实际返回 CSV，因为浏览器无法直接生成 Excel
      return exportData('csv');
    default:
      return JSON.stringify(data, null, 2);
  }
}

// 格式化存储大小
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}