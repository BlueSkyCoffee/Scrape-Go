import type { XiaohongshuNote, Platform, ScrapedData } from '../types';

/**
 * 小红书数据采集器
 */
export class XiaohongshuScraper {
  /**
   * 采集小红书笔记数据
   */
  static async scrapeNote(url: string): Promise<ScrapedData> {
    try {
      // 发送消息到 content script 进行采集
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]?.id) {
        throw new Error('No active tab found');
      }

      const response = await browser.tabs.sendMessage(tabs[0].id, {
        type: 'SCRAPE_PAGE'
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Scraping failed');
      }
    } catch (error) {
      console.error('Error scraping xiaohongshu note:', error);
      throw error;
    }
  }

  /**
   * 检查 URL 是否支持采集
   */
  static canScrape(url: string): boolean {
    return url.includes('xiaohongshu.com') && url.includes('/explore/');
  }

  /**
   * 从 HTML 中提取数据（备用方法）
   */
  static extractFromHTML(html: string): Partial<XiaohongshuNote> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const titleElement = doc.querySelector('meta[property="og:title"]');
    const descElement = doc.querySelector('meta[property="og:description"]');
    const imageElement = doc.querySelector('meta[property="og:image"]');

    return {
      title: titleElement?.getAttribute('content') || '',
      content: descElement?.getAttribute('content') || '',
      images: imageElement?.getAttribute('content') ? [imageElement.getAttribute('content')!] : []
    };
  }

  /**
   * 验证数据完整性
   */
  static validateData(data: XiaohongshuNote): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.id) {
      errors.push('缺少笔记 ID');
    }

    if (!data.title && !data.content) {
      errors.push('缺少标题和内容');
    }

    if (!data.url) {
      errors.push('缺少 URL');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
