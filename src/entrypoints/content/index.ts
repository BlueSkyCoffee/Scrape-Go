export default defineContentScript({
  matches: ['*://*.xiaohongshu.com/*'],
  main() {
    console.log('Scrape-Go content script loaded on xiaohongshu');

    // 监听来自 sidepanel 或 background 的消息
    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      console.log('Content script received message:', message.type);

      if (message.type === 'SCRAPE_PAGE') {
        try {
          const data = await scrapeXiaohongshuPage();
          console.log('Scraped data successfully, sending to background...');
          
          // 发送消息到 background script
          await browser.runtime.sendMessage({
            type: 'SCRAPED_DATA',
            data
          });
          
          console.log('Data sent to background');
          return { success: true, data };
        } catch (error) {
          console.error('Scraping error:', error);
          return { success: false, error: (error as Error).message };
        }
      }

      return false;
    });

    // 在页面上注入采集按钮
    injectScrapeButton();
  },
});

function injectScrapeButton() {
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    z-index: 99999;
  `;

  const scrapeButton = document.createElement('button');
  scrapeButton.textContent = '采集';
  scrapeButton.style.cssText = `
    padding: 10px 20px;
    background: #ff2442;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  `;

  scrapeButton.addEventListener('mouseenter', () => {
    scrapeButton.style.transform = 'scale(1.05)';
  });

  scrapeButton.addEventListener('mouseleave', () => {
    scrapeButton.style.transform = 'scale(1)';
  });

  scrapeButton.addEventListener('click', async () => {
    try {
      scrapeButton.textContent = '采集中...';
      scrapeButton.style.background = '#666';

      const data = await scrapeXiaohongshuPage();
      await browser.runtime.sendMessage({
        type: 'SCRAPED_DATA',
        data
      });

      // 保存最后一次采集的数据用于下载
      (window as any).lastScrapedData = data;

      scrapeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        采集成功
      `;
      scrapeButton.style.background = '#10b981';
      setTimeout(() => {
        scrapeButton.textContent = '采集';
        scrapeButton.style.background = '#ff2442';
      }, 2000);
    } catch (error) {
      console.error('Scraping error:', error);
          scrapeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        失败
      `;
      scrapeButton.style.background = '#ef4444';
      setTimeout(() => {
        scrapeButton.textContent = '采集';
        scrapeButton.style.background = '#ff2442';
      }, 2000);
    }
  });

  const downloadButton = document.createElement('button');
  downloadButton.textContent = '下载';
  downloadButton.style.cssText = `
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  `;

  downloadButton.addEventListener('mouseenter', () => {
    downloadButton.style.transform = 'scale(1.05)';
  });

  downloadButton.addEventListener('mouseleave', () => {
    downloadButton.style.transform = 'scale(1)';
  });

  downloadButton.addEventListener('click', async () => {
    try {
      const lastData = (window as any).lastScrapedData;

      if (!lastData) {
        alert('请先采集数据再下载！');
        return;
      }

      // 生成文件名
      const noteId = lastData.data.id || 'note';
      const filename = `xiaohongshu-${noteId}-${Date.now()}.json`;

      // 创建下载
      const dataStr = JSON.stringify(lastData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      // 显示成功提示
      const originalText = downloadButton.textContent;
      downloadButton.textContent = '已下载';
      downloadButton.style.background = '#10b981';
      setTimeout(() => {
        downloadButton.textContent = originalText;
        downloadButton.style.background = '#3b82f6';
      }, 2000);
    } catch (error) {
      console.error('Download error:', error);
      alert('下载失败：' + (error as Error).message);
    }
  });

  container.appendChild(scrapeButton);
  container.appendChild(downloadButton);
  document.body.appendChild(container);
}

async function scrapeXiaohongshuPage() {
  const url = window.location.href;

  // 尝试从页面中提取数据
  const titleElement = document.querySelector('meta[property="og:title"]');
  const descElement = document.querySelector('meta[property="og:description"]');
  const imageElement = document.querySelector('meta[property="og:image"]');

  const title = titleElement?.getAttribute('content') || '';
  const content = descElement?.getAttribute('content') || '';
  const image = imageElement?.getAttribute('content') || '';

  // 尝试从 window.__INITIAL_STATE__ 提取数据（小红书常见的数据存储方式）
  let authorName = '';
  let authorAvatar = '';
  let authorId = '';
  let authorLink = '';
  let publishTime = '';
  let tags: string[] = [];

  try {
    // 尝试获取初始状态
    const initialData = (window as any).__INITIAL_STATE__ || (window as any).__INITIAL_SSR_STATE__;

    if (initialData?.note?.noteDetailMap) {
      const notes = Object.values(initialData.note.noteDetailMap) as any[];
      if (notes.length > 0) {
        const note = notes[0];
        authorName = note.user?.nickname || authorName;
        authorAvatar = note.user?.avatar || authorAvatar;
        authorId = note.user?.webId || note.user?.userId || '';
        publishTime = note.time || note.createTime || '';

        // 提取标签
        if (note.noteCard?.tagList) {
          tags = note.noteCard.tagList.map((tag: any) => tag.name);
        } else if (note.tagList) {
          tags = note.tagList.map((tag: any) => tag.name);
        }
      }
    }
  } catch (err) {
    console.log('Could not extract from initial state:', err);
  }

  // 备用方法：从页面元素提取
  if (!authorName) {
    const authorElement = document.querySelector('[title*="用户"], [class*="user"], [class*="author"]');
    if (authorElement) {
      const titleAttr = authorElement.getAttribute('title');
      const textContent = authorElement.textContent?.trim();
      authorName = titleAttr || textContent || '';
    }
  }

  // 尝试提取作者链接
  const authorLinkElement = document.querySelector('a[href*="/user/profile/"]');
  if (authorLinkElement) {
    authorLink = authorLinkElement.getAttribute('href') || '';
  }

  // 提取图片列表
  const images: string[] = [];
  if (image) {
    images.push(image);
  }

  // 尝试从页面中提取更多图片
  const imgElements = document.querySelectorAll('img[src*="xhslink"]');
  imgElements.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !images.includes(src)) {
      images.push(src);
    }
  });

  // 限制图片数量
  if (images.length > 9) {
    images.length = 9;
  }

  // 尝试提取点赞、收藏、评论数
  const likes = extractCount('like', 'likes', '点赞');
  const collects = extractCount('collect', 'collects', '收藏');
  const comments = extractCount('comment', 'comments', '评论');

  const noteId = extractNoteId(url);

  // 尝试提取发布时间
  if (!publishTime) {
    const timeElement = document.querySelector('[class*="time"], [class*="date"]');
    if (timeElement) {
      publishTime = timeElement.textContent?.trim() || '';
    }
  }

  // 尝试从内容中提取标签（#话题）
  if (tags.length === 0) {
    const tagMatches = content.match(/#\S+/g);
    if (tagMatches) {
      tags = tagMatches.map(tag => tag.replace('#', ''));
    }
  }

  const scrapedData = {
    platform: 'xiaohongshu' as const,
    url,
    timestamp: Date.now(),
    data: {
      id: noteId,
      title,
      content,
      author: {
        id: authorId,
        name: authorName,
        avatar: authorAvatar,
        link: authorLink
      },
      images,
      likes,
      collects,
      comments,
      tags,
      publishTime,
      url,
      timestamp: Date.now()
    }
  };

  console.log('Scraped data:', scrapedData);
  return scrapedData;
}

function extractCount(...keywords: string[]): number {
  const text = document.body.innerText;
  for (const keyword of keywords) {
    const regex = new RegExp(`(\\d+)\\s*${keyword}`, 'i');
    const match = text.match(regex);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return 0;
}

function extractNoteId(url: string): string {
  const match = url.match(/\/explore\/([a-f0-9]+)/);
  return match ? match[1] : '';
}
