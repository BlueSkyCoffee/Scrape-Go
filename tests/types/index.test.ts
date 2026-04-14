import { describe, it, expect } from 'vitest';
import type { XiaohongshuNote, Settings } from '../../src/types';

describe('Types', () => {
  describe('XiaohongshuNote', () => {
    it('should have correct structure', () => {
      const note: XiaohongshuNote = {
        id: 'test-id',
        title: 'Test Title',
        content: 'Test Content',
        author: {
          id: 'author-id',
          name: 'Test Author',
          avatar: 'https://example.com/avatar.jpg'
        },
        images: ['https://example.com/image.jpg'],
        likes: 100,
        collects: 50,
        comments: 25,
        url: 'https://www.xiaohongshu.com/explore/test',
        timestamp: Date.now()
      };

      expect(note.id).toBe('test-id');
      expect(note.title).toBe('Test Title');
      expect(note.author.name).toBe('Test Author');
      expect(note.likes).toBe(100);
    });
  });

  describe('Settings', () => {
    it('should have correct default values', () => {
      const settings: Settings = {
        autoScrape: false,
        saveImages: true,
        notifications: true,
        maxConcurrent: 3
      };

      expect(settings.autoScrape).toBe(false);
      expect(settings.saveImages).toBe(true);
      expect(settings.notifications).toBe(true);
      expect(settings.maxConcurrent).toBe(3);
    });
  });
});
