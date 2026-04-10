import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { notificationService } from '@/services/notificationService'; // Notification Service 
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Clock, AlertCircle, Award, MessageSquare, Check, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// 1. Interface define karein taaki 'any' ka warning hat jaye
interface NotificationData {
  id: string;
  type: 'ISSUE_UPDATE' | 'REWARD' | 'MESSAGE' | 'ALERT';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]); // Typed State
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetch function ko useCallback mein wrap karein (Yellow line dependency fix)
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error: any) {
      toast.error("Failed to load notifications");
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
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error("Error marking as read", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ISSUE_UPDATE': return <Clock className="h-5 w-5 text-primary" />;
      case 'REWARD': return <Award className="h-5 w-5 text-yellow-500" />;
      case 'MESSAGE': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'ALERT': return <AlertCircle className="h-5 w-5 text-destructive" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadList = notifications.filter(n => !n.isRead);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground text-sm">Stay updated on your issues and rewards</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Check className="h-4 w-4" /> Mark All as Read
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
              <NotificationItem 
                key={n.id} 
                n={n} 
                onRead={handleMarkRead} 
                getIcon={getNotificationIcon} 
              />
            ))
          ) : <EmptyState message="No notifications yet" />}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3 mt-0">
          {unreadList.length > 0 ? (
            unreadList.map((n) => (
              <NotificationItem 
                key={n.id} 
                n={n} 
                onRead={handleMarkRead} 
                getIcon={getNotificationIcon} 
              />
            ))
          ) : <EmptyState message="All caught up!" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-component to keep code clean and fix yellow lines in loops
function NotificationItem({ n, onRead, getIcon }: any) {
  return (
    <div onClick={() => onRead(n.id, n.isRead)}>
      <Card className={`cursor-pointer transition-all hover:shadow-sm ${!n.isRead ? 'bg-primary/5 border-primary/20' : 'opacity-80'}`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm">
              {getIcon(n.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-sm font-semibold ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {n.title}
                </h3>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
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