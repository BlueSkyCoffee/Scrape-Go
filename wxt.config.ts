import { defineConfig } from 'wxt';

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
    action: {
      default_icon: {
        '16': 'icon/16.png',
        '32': 'icon/32.png',
        '48': 'icon/48.png',
        '96': 'icon/96.png',
        '128': 'icon/128.png'
      },
      default_title: '打开 Scrape-Go 侧边栏'
    },
    side_panel: {
      default_path: 'sidepanel.html'
    },
    options_page: 'options.html',
    commands: {
      '_execute_action': {
        suggested_key: {
          default: 'Ctrl+Shift+Y',
          mac: 'Command+Shift+Y'
        },
        description: '打开侧边栏'
      }
    }
  }
});
