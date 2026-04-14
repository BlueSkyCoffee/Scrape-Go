import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'Scrape-Go',
    description: '自动采集社交媒体和电商网站数据',
    version: '1.0.0',
    permissions: [
      'storage',
      'activeTab',
      'tabs',
      'scripting',
      'sidePanel'
    ],
    host_permissions: [
      '*://*.xiaohongshu.com/*',
      '*://*.xhslink.com/*'
    ],
    side_panel: {
      default_path: 'sidepanel.html'
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: true
    }
  }
});
