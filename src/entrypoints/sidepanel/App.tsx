import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ScrapedData, XiaohongshuNote } from '../types';
import { Download, Trash2, RefreshCw, CheckCircle, XCircle, Heart, Star, MessageSquare, Settings } from 'lucide-react';
import './App.css';

export default function App() {
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadScrapedData();
  }, []);

  const loadScrapedData = async () => {
    try {
      const result = await browser.storage.local.get('scrapedData');
      setScrapedData(result.scrapedData || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setError(null);
  };

  const handleScrape = async () => {
    setIsScraping(true);
    setError(null);
    setSuccess(false);

    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]?.id) {
        throw new Error('No active tab found');
      }

      console.log('Sending scrape message to tab:', tabs[0].id, tabs[0].url);

      const response = await browser.tabs.sendMessage(tabs[0].id, {
        type: 'SCRAPE_PAGE'
      });

      console.log('Received response:', response);

      if (response.success) {
        setSuccess(true);
        // 延迟一下再加载数据，确保存储已更新
        setTimeout(() => {
          loadScrapedData();
        }, 500);
      } else {
        setError(response.error || '采集失败');
      }
    } catch (err) {
      console.error('Scrape error:', err);
      const errorMessage = (err as Error).message;

      if (errorMessage.includes('Receiving end does not exist')) {
        setError('无法连接到页面。请确保您已刷新小红书页面，或重新打开页面。');
      } else if (errorMessage.includes('Could not establish connection')) {
        setError('连接失败。请确保当前页面支持采集，或刷新页面后重试。');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsScraping(false);
    }
  };

  const handleClearAll = async () => {
    if (confirm('确定要清空所有采集的数据吗？')) {
      await browser.storage.local.set({ scrapedData: [] });
      setScrapedData([]);
    }
  };

  const handleExport = async () => {
    const dataStr = JSON.stringify(scrapedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scrape-go-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenOptions = async () => {
    await browser.runtime.openOptionsPage();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const renderXiaohongshuCard = (note: XiaohongshuNote, index: number) => (
    <Card key={index} className="mb-3">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-semibold line-clamp-2 flex-1">
            {note.title || '无标题'}
          </CardTitle>
        </div>
        <CardDescription className="text-xs mt-1">
          {note.author.name} · {note.publishTime || formatDate(note.timestamp)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
          {note.content || '无内容'}
        </p>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.slice(0, 5).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2 mb-2">
          {note.images.slice(0, 3).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Image ${i}`}
              className="w-16 h-16 object-cover rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {note.likes}
          </Badge>
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Star className="w-3 h-3" />
            {note.collects}
          </Badge>
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {note.comments}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="sidepanel-container h-full flex flex-col bg-background text-foreground">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold flex items-center gap-2">
            Scrape-Go
            <Badge variant="secondary" className="text-xs">v1.0.0</Badge>
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenOptions}
            title="打开设置"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 mb-3">
          <Button
            onClick={handleScrape}
            disabled={isScraping}
            size="sm"
            className="flex-1"
          >
            {isScraping ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                采集中...
              </>
            ) : (
              '采集当前页面'
            )}
          </Button>
          <Button
            onClick={loadScrapedData}
            variant="outline"
            size="sm"
            disabled={isScraping}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={scrapedData.length === 0}
            title="导出所有采集的数据为 JSON 文件"
          >
            <Download className="w-4 h-4 mr-2" />
            导出数据 ({scrapedData.length})
          </Button>
          <Button
            onClick={handleClearAll}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={scrapedData.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="m-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

    {success && (
        <Alert className="m-4 border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            采集成功！
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-hidden px-4">
        <ScrollArea className="h-full">
          <div className="pr-4 pb-4">
            {scrapedData.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">暂无采集数据</p>
                <p className="text-xs mt-1">访问小红书笔记页面，点击"采集"按钮开始采集</p>
              </div>
            ) : (
              scrapedData.map((data, index) => {
                if (data.platform === 'xiaohongshu') {
                  return renderXiaohongshuCard(data.data as XiaohongshuNote, index);
                }
                return null;
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-3 border-t text-center">
        <p className="text-xs text-muted-foreground">
          已采集 {scrapedData.length} 条数据
        </p>
      </div>
    </div>
  );
}
