import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Settings, DataStats, ScrapingSettings as ScrapingSettingsType, StorageSettings as StorageSettingsType, NotificationSettings as NotificationSettingsType } from '@/types';
import { defaultSettings, defaultDataStats } from '@/types';
import { loadSettings, saveSettings, loadDataStats, saveDataStats, exportData, clearAllData } from './lib/settings';
import {
  Zap,
  Database,
  Bell,
  FileJson,
  FileSpreadsheet,
  Download,
  Trash2,
  RotateCcw,
  Settings as SettingsIcon,
  Globe,
  Gauge,
  Image,
  Video,
  CheckCircle2,
  XCircle,
  Monitor,
  Volume2,
  Sparkles,
  ChevronRight,
  HardDrive,
  AlertCircle,
} from 'lucide-react';
import './App.css';

// ─── Navigation ──────────────────────────────────────────────────────────────

type SectionId = 'scraping' | 'storage' | 'notifications' | 'data';

interface NavSection {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: NavSection[] = [
  { id: 'scraping', label: '采集设置', icon: Zap },
  { id: 'storage', label: '存储设置', icon: Database },
  { id: 'notifications', label: '通知设置', icon: Bell },
  { id: 'data', label: '数据管理', icon: FileJson },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ active, onSectionChange }: {
  active: SectionId;
  onSectionChange: (id: SectionId) => void;
}) {
  return (
    <aside className="w-60 flex flex-col border-r bg-card/50 h-full">
      <div className="p-4 flex items-center gap-3">
        <div className="size-10 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="size-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold leading-tight">Scrape-Go</h1>
          <p className="text-xs text-muted-foreground">自动采集数据插件</p>
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="flex flex-col gap-1">
          {sections.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <Button
                key={id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn('justify-start gap-2 w-full', isActive && 'font-medium')}
                onClick={() => onSectionChange(id)}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{label}</span>
                {isActive && <ChevronRight className="size-3 ml-auto shrink-0" />}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">主题</span>
          <ThemeSwitcher />
        </div>
      </div>
    </aside>
  );
}

// ─── Setting Row ─────────────────────────────────────────────────────────────

function SettingRow({ label, description, icon: Icon, action }: {
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {Icon && <Icon className="size-4 mt-0.5 text-muted-foreground shrink-0" />}
        <div className="min-w-0">
          <Label className="text-sm">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

// ─── Scraping Settings ───────────────────────────────────────────────────────

function ScrapingSection({ settings, onChange }: {
  settings: ScrapingSettingsType;
  onChange: <K extends keyof ScrapingSettingsType>(key: K, value: ScrapingSettingsType[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* 自动采集 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="size-4" />
            <CardTitle className="text-base">自动采集</CardTitle>
          </div>
          <CardDescription>配置自动采集功能开关</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingRow
            label="自动采集开关"
            description="访问支持的网站时自动开始采集"
            action={
              <Switch
                checked={settings.autoScrape}
                onCheckedChange={(v) => onChange('autoScrape', v)}
              />
            }
          />
        </CardContent>
      </Card>

      {/* 采集平台 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="size-4" />
            <CardTitle className="text-base">采集平台</CardTitle>
          </div>
          <CardDescription>选择要采集数据的平台（可多选）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {([
              { value: 'xiaohongshu', label: '小红书' },
              { value: 'douyin', label: '抖音' },
              { value: 'kuaishou', label: '快手' },
              { value: 'bilibili', label: 'B站' },
              { value: 'weibo', label: '微博' },
              { value: 'taobao', label: '淘宝' },
            ] as const).map((p) => {
              const selected = settings.scrapeSources.includes(p.value as any);
              return (
                <Button
                  key={p.value}
                  variant={selected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const next = selected
                      ? settings.scrapeSources.filter((s) => s !== p.value)
                      : [...settings.scrapeSources, p.value];
                    onChange('scrapeSources', next as typeof settings.scrapeSources);
                  }}
                  className="gap-1.5"
                >
                  {p.label}
                </Button>
              );
            })}
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <Badge variant="secondary">已选 {settings.scrapeSources.length} 个</Badge>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange('scrapeSources', ['xiaohongshu', 'douyin', 'kuaishou', 'bilibili', 'weibo', 'taobao'])}
              >
                全选
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange('scrapeSources', [])}
                disabled={settings.scrapeSources.length === 0}
              >
                清空
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 采集规则 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gauge className="size-4" />
            <CardTitle className="text-base">采集规则</CardTitle>
          </div>
          <CardDescription>配置并发数、间隔和数据类型</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* 并发数量 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>并发数量</Label>
              <Badge variant="secondary" className="min-w-[2.5rem] justify-center">
                {settings.maxConcurrent}
              </Badge>
            </div>
            <Slider
              value={[settings.maxConcurrent]}
              onValueChange={([v]) => onChange('maxConcurrent', v)}
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          <Separator />

          {/* 采集间隔 */}
          <div className="flex flex-col gap-2">
            <Label>采集间隔</Label>
            <p className="text-xs text-muted-foreground">每次采集之间的延迟，防止被限制</p>
            <Select
              value={settings.delay.toString()}
              onValueChange={(v) => onChange('delay', parseInt(v, 10))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="500">0.5 秒</SelectItem>
                  <SelectItem value="1000">1 秒</SelectItem>
                  <SelectItem value="2000">2 秒</SelectItem>
                  <SelectItem value="3000">3 秒</SelectItem>
                  <SelectItem value="5000">5 秒</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* 采集数据类型 */}
          <div className="flex flex-col gap-2">
            <Label>采集数据类型</Label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'title', label: '标题' },
                { value: 'content', label: '内容' },
                { value: 'images', label: '图片' },
                { value: 'videos', label: '视频' },
                { value: 'comments', label: '评论' },
              ] as const).map((dt) => {
                const selected = settings.dataTypes.includes(dt.value as any);
                return (
                  <div
                    key={dt.value}
                    className="flex items-center gap-3"
                    onClick={() => {
                      const next = selected
                        ? settings.dataTypes.filter((d) => d !== dt.value)
                        : [...settings.dataTypes, dt.value];
                      onChange('dataTypes', next as typeof settings.dataTypes);
                    }}
                  >
                    <Checkbox
                      id={`datatype-${dt.value}`}
                      checked={selected}
                    />
                    <Label htmlFor={`datatype-${dt.value}`} className="text-sm cursor-pointer flex-1">
                      {dt.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Storage Settings ────────────────────────────────────────────────────────

function StorageSection({ settings, onChange, onExport }: {
  settings: StorageSettingsType;
  onChange: <K extends keyof StorageSettingsType>(key: K, value: StorageSettingsType[K]) => void;
  onExport: (format: 'json' | 'csv' | 'excel') => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* 文件保存 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="size-4" />
            <CardTitle className="text-base">文件保存</CardTitle>
          </div>
          <CardDescription>配置图片和视频的保存选项</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <SettingRow
            label="保存图片"
            description="采集时下载并保存图片到本地"
            action={
              <Switch
                checked={settings.saveImages}
                onCheckedChange={(v) => onChange('saveImages', v)}
              />
            }
          />
          <Separator />
          <SettingRow
            label="保存视频"
            description="采集时下载并保存视频到本地"
            action={
              <Switch
                checked={settings.saveVideos}
                onCheckedChange={(v) => onChange('saveVideos', v)}
              />
            }
          />
        </CardContent>
      </Card>

      {/* 导出格式 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="size-4" />
            <CardTitle className="text-base">导出格式</CardTitle>
          </div>
          <CardDescription>选择导出数据的默认格式</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.exportFormat}
            onValueChange={(v) => onChange('exportFormat', v as StorageSettingsType['exportFormat'])}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { value: 'json', label: 'JSON', Icon: FileJson },
              { value: 'csv', label: 'CSV', Icon: FileSpreadsheet },
              { value: 'excel', label: 'Excel', Icon: Download },
            ].map(({ value, label, Icon }) => (
              <label
                key={value}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border p-4 cursor-pointer transition-colors',
                  settings.exportFormat === value
                    ? 'border-primary bg-primary/10'
                    : 'hover:bg-accent'
                )}
              >
                <RadioGroupItem value={value} id={`fmt-${value}`} className="sr-only" />
                <Icon className="size-6 mb-2 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </RadioGroup>
          <Separator className="my-4" />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onExport('json')}>
              <FileJson className="size-4" />
              导出 JSON
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onExport('csv')}>
              <FileSpreadsheet className="size-4" />
              导出 CSV
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onExport('excel')}>
              <Download className="size-4" />
              导出 Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 自动清理 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RotateCcw className="size-4" />
            <CardTitle className="text-base">自动清理</CardTitle>
          </div>
          <CardDescription>配置自动清理旧数据的选项</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <SettingRow
            label="自动清理"
            description="定期自动清理超过天数的旧数据"
            action={
              <Switch
                checked={settings.autoCleanup}
                onCheckedChange={(v) => onChange('autoCleanup', v)}
              />
            }
          />
          {settings.autoCleanup && (
            <div className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <Label className="text-sm">清理天数</Label>
                <p className="text-xs text-muted-foreground">超过此天数的数据将被自动清理</p>
              </div>
              <Select
                value={settings.cleanupDays.toString()}
                onValueChange={(v) => onChange('cleanupDays', parseInt(v, 10))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="7">7 天</SelectItem>
                    <SelectItem value="14">14 天</SelectItem>
                    <SelectItem value="30">30 天</SelectItem>
                    <SelectItem value="60">60 天</SelectItem>
                    <SelectItem value="90">90 天</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div className="min-w-0">
              <Label className="text-sm">最大存储空间</Label>
              <p className="text-xs text-muted-foreground">超过限制时将提示清理数据</p>
            </div>
            <Select
              value={settings.maxStorageSize.toString()}
              onValueChange={(v) => onChange('maxStorageSize', parseInt(v, 10))}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="100">100 MB</SelectItem>
                  <SelectItem value="500">500 MB</SelectItem>
                  <SelectItem value="1000">1 GB</SelectItem>
                  <SelectItem value="2000">2 GB</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <SettingRow
            label="自动备份"
            description="定期自动备份采集的数据"
            action={
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(v) => onChange('autoBackup', v)}
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Notification Settings ───────────────────────────────────────────────────

function NotificationSection({ settings, onChange }: {
  settings: NotificationSettingsType;
  onChange: <K extends keyof NotificationSettingsType>(key: K, value: NotificationSettingsType[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-4" />
            <CardTitle className="text-base">通知偏好</CardTitle>
          </div>
          <CardDescription>配置采集完成和失败的提醒通知</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <SettingRow
            label="采集完成通知"
            description="采集任务成功完成时发送通知"
            icon={CheckCircle2}
            action={
              <Switch
                checked={settings.notifyOnComplete}
                onCheckedChange={(v) => onChange('notifyOnComplete', v)}
              />
            }
          />
          <Separator />
          <SettingRow
            label="采集失败通知"
            description="采集任务失败时发送通知"
            icon={XCircle}
            action={
              <Switch
                checked={settings.notifyOnError}
                onCheckedChange={(v) => onChange('notifyOnError', v)}
              />
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="size-4" />
            <CardTitle className="text-base">桌面通知</CardTitle>
          </div>
          <CardDescription>配置系统级别的桌面通知</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <SettingRow
            label="桌面通知"
            description="使用系统通知中心显示通知"
            icon={Monitor}
            action={
              <Switch
                checked={settings.desktopNotifications}
                onCheckedChange={(v) => onChange('desktopNotifications', v)}
              />
            }
          />
          <Separator />
          <SettingRow
            label="通知音效"
            description="收到通知时播放提示音"
            icon={Volume2}
            action={
              <Switch
                checked={settings.notificationSound}
                onCheckedChange={(v) => onChange('notificationSound', v)}
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Data Management ─────────────────────────────────────────────────────────

function DataSection({ stats, onExport, onClear }: {
  stats: DataStats;
  onExport: (format: 'json' | 'csv' | 'excel') => void;
  onClear: () => void;
}) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 数据统计 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="size-4" />
            <CardTitle className="text-base">数据统计</CardTitle>
          </div>
          <CardDescription>查看当前采集数据的统计信息</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '总数据', value: stats.totalItems.toLocaleString(), Icon: FileJson },
              { label: '图片', value: stats.totalImages.toLocaleString(), Icon: Image },
              { label: '视频', value: stats.totalVideos.toLocaleString(), Icon: Video },
              { label: '存储', value: formatSize(stats.storageUsed), Icon: HardDrive },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="rounded-lg border p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="size-4" />
                  <span className="text-xs">{label}</span>
                </div>
                <p className="text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">存储空间使用情况</span>
              <Badge variant="secondary">
                {formatSize(stats.storageUsed)} / {formatSize(1000 * 1024 * 1024)}
              </Badge>
            </div>
            <Progress value={Math.min((stats.storageUsed / (1000 * 1024 * 1024)) * 100, 100)} className="h-2" />
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>最后更新: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('zh-CN') : '暂无'}</span>
          </div>
        </CardContent>
      </Card>

      {/* 导出数据 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="size-4" />
            <CardTitle className="text-base">导出数据</CardTitle>
          </div>
          <CardDescription>将采集的数据导出为指定格式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onExport('json')} disabled={stats.totalItems === 0}>
              <FileJson className="size-4" />
              JSON
            </Button>
            <Button variant="outline" onClick={() => onExport('csv')} disabled={stats.totalItems === 0}>
              <FileSpreadsheet className="size-4" />
              CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 清空数据 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="size-4" />
            <CardTitle className="text-base">清空数据</CardTitle>
          </div>
          <CardDescription>清空所有采集的数据</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              清空数据后将无法恢复，请谨慎操作。建议先导出数据备份。
            </AlertDescription>
          </Alert>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={stats.totalItems === 0}>
                <Trash2 className="size-4" />
                清空所有数据
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确定要清空所有数据吗？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作将永久删除所有采集的数据，包括 {stats.totalItems} 条记录、
                  {stats.totalImages} 张图片和 {stats.totalVideos} 个视频。此操作无法撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('scraping');
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [dataStats, setDataStats] = useState<DataStats>(defaultDataStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedSettings, loadedStats] = await Promise.all([
          loadSettings(),
          loadDataStats(),
        ]);
        setSettings(loadedSettings);
        setDataStats(loadedStats);
      } catch {
        toast.error('加载设置失败');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const updateSettings = useCallback(<K extends keyof Settings>(
    key: K,
    subKey: keyof Settings[K],
    value: Settings[K][keyof Settings[K]]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: { ...prev[key], [subKey]: value } };
      saveSettings(next).catch(() => toast.error('保存设置失败'));
      return next;
    });
  }, []);

  const handleExport = useCallback(async (format: 'json' | 'csv' | 'excel') => {
    try {
      const data = await exportData(format);
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrape-go-export.${format === 'excel' ? 'csv' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`已导出为 ${format.toUpperCase()}`);
    } catch {
      toast.error('导出失败');
    }
  }, []);

  const handleClear = useCallback(async () => {
    try {
      await clearAllData();
      setDataStats(defaultDataStats);
      toast.success('数据已清空');
    } catch {
      toast.error('清空失败');
    }
  }, []);

  const handleReset = useCallback(() => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings).then(() => toast.success('设置已重置'));
  }, []);

  if (loading) {
    return (
      <div className="h-screen p-6 flex flex-col gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const sectionTitles: Record<SectionId, string> = {
    scraping: '采集设置',
    storage: '存储设置',
    notifications: '通知设置',
    data: '数据管理',
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* 左侧侧边栏 */}
      <Sidebar active={activeSection} onSectionChange={setActiveSection} />

      {/* 右侧内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部标题 */}
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold">{sectionTitles[activeSection]}</h2>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4" />
            重置设置
          </Button>
        </header>

        {/* 内容 */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {activeSection === 'scraping' && (
              <ScrapingSection
                settings={settings.scraping}
                onChange={(key, value) => updateSettings('scraping', key, value)}
              />
            )}
            {activeSection === 'storage' && (
              <StorageSection
                settings={settings.storage}
                onChange={(key, value) => updateSettings('storage', key, value)}
                onExport={handleExport}
              />
            )}
            {activeSection === 'notifications' && (
              <NotificationSection
                settings={settings.notifications}
                onChange={(key, value) => updateSettings('notifications', key, value)}
              />
            )}
            {activeSection === 'data' && (
              <DataSection
                stats={dataStats}
                onExport={handleExport}
                onClear={handleClear}
              />
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
