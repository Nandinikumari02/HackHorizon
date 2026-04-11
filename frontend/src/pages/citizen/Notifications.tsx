import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notificationService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface NotificationRow {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error('Could not update notification');
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadList = notifications.filter((n) => !n.isRead);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground text-sm">Alerts from EcoSarthi</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleMarkAll} disabled={unreadCount === 0}>
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-0">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <NotificationItem key={n.id} n={n} onRead={handleMarkRead} />
            ))
          ) : (
            <EmptyState message="No notifications yet" />
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3 mt-0">
          {unreadList.length > 0 ? (
            unreadList.map((n) => <NotificationItem key={n.id} n={n} onRead={handleMarkRead} />)
          ) : (
            <EmptyState message="All caught up" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationItem({
  n,
  onRead,
}: {
  n: NotificationRow;
  onRead: (id: string, isRead: boolean) => void;
}) {
  return (
    <div onClick={() => onRead(n.id, n.isRead)}>
      <Card
        className={`cursor-pointer transition-all hover:shadow-sm ${
          !n.isRead ? 'bg-primary/5 border-primary/20' : 'opacity-90'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2 mb-1">
                <h3
                  className={`text-sm font-semibold leading-snug ${
                    !n.isRead ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {n.message}
                </h3>
                <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20 border-2 border-dashed rounded-xl">
      <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  );
}
