import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Settings } from '../types';
import { 
  Settings as SettingsIcon, 
  Info as InfoIcon, 
  HelpCircle as HelpIcon,
  Github,
  Heart,
  ExternalLink
} from 'lucide-react';
import './App.css';

export default function App() {
  const [settings, setSettings] = useState<Settings>({
    autoScrape: false,
    saveImages: true,
    notifications: true,
    maxConcurrent: 3
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await browser.storage.local.get('settings');
      if (result.settings) {
        setSettings(result.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    setSaving(true);
    try {
      await browser.storage.local.set({ settings: newSettings });
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  return (
    <div className="options-container min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            Scrape-Go
            <Badge variant="secondary">v1.0.0</Badge>
          </h1>
          <p className="text-muted-foreground">
            自动采集社交媒体和电商网站数据
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              设置
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpIcon className="w-4 h-4" />
              帮助
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <InfoIcon className="w-4 h-4" />
              关于
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>插件设置</CardTitle>
                <CardDescription>
                  配置 Scrape-Go 的行为和选项
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    加载中...
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="auto-scrape">自动采集</Label>
                        <p className="text-sm text-muted-foreground">
                          访问支持的网站时自动开始采集
                        </p>
                      </div>
                      <Switch
                        id="auto-scrape"
                        checked={settings.autoScrape}
                        onCheckedChange={(checked) =>
                          handleSettingChange('autoScrape', checked)
                        }
                        disabled={saving}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="save-images">保存图片</Label>
                        <p className="text-sm text-muted-foreground">
                          采集时下载并保存图片到本地
                        </p>
                      </div>
                      <Switch
                        id="save-images"
                        checked={settings.saveImages}
                        onCheckedChange={(checked) =>
                          handleSettingChange('saveImages', checked)
                        }
                        disabled={saving}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="notifications">显示通知</Label>
                        <p className="text-sm text-muted-foreground">
                          采集完成时显示桌面通知
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={settings.notifications}
                        onCheckedChange={(checked) =>
                          handleSettingChange('notifications', checked)
                        }
                        disabled={saving}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label htmlFor="max-concurrent">最大并发数</Label>
                      <p className="text-sm text-muted-foreground">
                        同时进行采集任务的最大数量
                      </p>
                      <Select
                        value={settings.maxConcurrent.toString()}
                        onValueChange={(value) =>
                          handleSettingChange('maxConcurrent', parseInt(value, 10))
                        }
                        disabled={saving}
                      >
                        <SelectTrigger id="max-concurrent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle>使用帮助</CardTitle>
                <CardDescription>
                  了解如何使用 Scrape-Go
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        如何使用？
                      </h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>
                          访问支持采集的网站（如小红书）
                        </li>
                        <li>
                          打开浏览器侧边栏中的 Scrape-Go
                        </li>
                        <li>
                          点击"采集当前页面"按钮
                        </li>
                        <li>
                          等待采集完成，数据会显示在侧边栏中
                        </li>
                        <li>
                          可以随时导出采集的数据为 JSON 格式
                        </li>
                      </ol>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        支持的网站
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>小红书（xiaohongshu.com）</li>
                        <li>更多平台正在开发中...</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        常见问题
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium">采集失败怎么办？</p>
                          <p className="text-muted-foreground mt-1">
                            请确保您已登录目标网站，并且有权限访问该页面。
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">数据保存在哪里？</p>
                          <p className="text-muted-foreground mt-1">
                            数据保存在浏览器的本地存储中，您可以通过"导出数据"功能导出备份。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>关于</CardTitle>
                <CardDescription>
                  Scrape-Go 浏览器插件信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Scrape-Go
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      一个强大的浏览器插件，用于自动采集社交媒体和电商网站的数据。
                    </p>
                    <Badge variant="secondary">v1.0.0</Badge>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      技术栈
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">WXT</Badge>
                      <Badge variant="outline">React</Badge>
                      <Badge variant="outline">TypeScript</Badge>
                      <Badge variant="outline">shadcn/ui</Badge>
                      <Badge variant="outline">Tailwind CSS</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      链接
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        asChild
                      >
                        <a
                          href="https://github.com/openclaw/openclaw"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Github className="w-4 h-4" />
                          OpenClaw GitHub
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Made with
                      <Heart className="w-4 h-4 inline mx-1 text-red-500 fill-red-500" />
                      by OpenClaw
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
