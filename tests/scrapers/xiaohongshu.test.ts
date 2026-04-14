import { describe, it, expect, vi } from 'vitest';
import { XiaohongshuScraper } from '../../src/scrapers/xiaohongshu';

// Mock browser API
global.browser = {
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn()
  }
} as any;

describe('XiaohongshuScraper', () => {
  describe('canScrape', () => {
    it('should return true for valid xiaohongshu URLs', () => {
      expect(XiaohongshuScraper.canScrape('https://www.xiaohongshu.com/explore/123abc')).toBe(true);
      expect(XiaohongshuScraper.canScrape('https://xiaohongshu.com/explore/456def')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(XiaohongshuScraper.canScrape('https://www.example.com')).toBe(false);
      expect(XiaohongshuScraper.canScrape('https://www.xiaohongshu.com/discovery')).toBe(false);
    });
  });

  describe('extractFromHTML', () => {
    it('should extract basic data from HTML', () => {
      const html = `
        <html>
          <head>
            <meta property="og:title" content="Test Note" />
            <meta property="og:description" content="Test content" />
            <meta property="og:image" content="https://example.com/image.jpg" />
          </head>
          <body></body>
        </html>
      `;

      const result = XiaohongshuScraper.extractFromHTML(html);

      expect(result.title).toBe('Test Note');
      expect(result.content).toBe('Test content');
      expect(result.images).toEqual(['https://example.com/image.jpg']);
    });

    it('should handle missing meta tags', () => {
      const html = '<html><head></head><body></body></html>';
      const result = XiaohongshuScraper.extractFromHTML(html);

      expect(result.title).toBe('');
      expect(result.content).toBe('');
      expect(result.images).toEqual([]);
    });
  });

  describe('scrapeNote', () => {
    it('should send message to content script', async () => {
      const mockTabs = [
        { id: 1, url: 'https://www.xiaohongshu.com/explore/test' }
      ];
      
      vi.mocked(browser.tabs.query).mockResolvedValue(mockTabs as any);
      vi.mocked(browser.tabs.sendMessage).mockResolvedValue({
        success: true,
        data: {
          platform: 'xiaohongshu',
          url: 'https://www.xiaohongshu.com/explore/test',
          timestamp: Date.now()
        }
      } as any);

      const result = await XiaohongshuScraper.scrapeNote('https://www.xiaohongshu.com/explore/test');

      expect(browser.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true
      });
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(1, {
        type: 'SCRAPE_PAGE'
      });
      expect(result.platform).toBe('xiaohongshu');
    });

    it('should handle scraping errors', async () => {
      vi.mocked(browser.tabs.query).mockResolvedValue([]);
      
      await expect(
        XiaohongshuScraper.scrapeNote('https://www.xiaohongshu.com/explore/test')
      ).rejects.toThrow('No active tab found');
    });
  });
});
