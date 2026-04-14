export default defineBackground(() => {
  console.log('Scrape-Go background script started');

  browser.runtime.onInstalled.addListener(async () => {
    console.log('Scrape-Go installed');

    const defaultSettings = {
      autoScrape: false,
      saveImages: true,
      notifications: true,
      maxConcurrent: 3
    };

    await browser.storage.local.set({ settings: defaultSettings });
  });

  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id });
    }
  });

  // 改进消息监听器，确保返回 Promise
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message.type);

    if (message.type === 'SCRAPED_DATA') {
      return handleScrapedData(message.data);
    }

    if (message.type === 'GET_SETTINGS') {
      return getSettings();
    }

    if (message.type === 'UPDATE_SETTINGS') {
      return updateSettings(message.settings);
    }

    return false;
  });
});

async function handleScrapedData(data: any) {
  try {
    console.log('Handling scraped data:', data);

    // 验证数据
    if (!data || !data.platform || !data.data) {
      console.error('Invalid data format:', data);
      return { success: false, error: '无效的数据格式' };
    }

    const result = await browser.storage.local.get('scrapedData');
    const scrapedData = result.scrapedData || [];

    // 检查是否已存在（防止重复）
    const exists = scrapedData.some(
      (item: any) => item.data.id === data.data.id && item.platform === data.platform
    );

    if (exists) {
      console.log('Data already exists, skipping');
      return { success: true, message: '数据已存在' };
    }

    scrapedData.push(data);
    await browser.storage.local.set({ scrapedData });

    console.log('Data saved successfully, total items:', scrapedData.length);
    return { success: true };
  } catch (error) {
    console.error('Error saving scraped data:', error);
    return { success: false, error: (error as Error).message };
  }
}

async function getSettings() {
  const result = await browser.storage.local.get('settings');
  return result.settings || {
    autoScrape: false,
    saveImages: true,
    notifications: true,
    maxConcurrent: 3
  };
}

async function updateSettings(settings: any) {
  await browser.storage.local.set({ settings });
  return { success: true };
}
