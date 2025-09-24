"use client";

import React, { useState } from 'react';
import { Bell, X, Shield, TrendingUp, Activity, Wifi, WifiOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AnalyticsUpdate } from '@/hooks/useAdminAnalytics';

export interface AdminNotificationsProps {
  className?: string;
  recentUpdates: AnalyticsUpdate[];
  hasUnreadUpdates: boolean;
  isRealTimeConnected: boolean;
  onMarkAsRead: () => void;
}

/**
 * Real-time admin notifications component
 * Shows system updates, moderation alerts, and analytics changes
 */
export function AdminNotifications({
  className,
  recentUpdates,
  hasUnreadUpdates,
  isRealTimeConnected,
  onMarkAsRead,
}: AdminNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && hasUnreadUpdates) {
      onMarkAsRead();
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'moderation':
        return <Shield className="h-4 w-4 text-orange-600" />;
      case 'analytics':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'activity':
        return <Activity className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'moderation':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300';
      case 'analytics':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300';
      case 'activity':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const urgentUpdates = recentUpdates.filter(update => 
    update.type === 'moderation' && update.data?.change > 0
  );

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative h-9 w-9 p-0"
          >
            <Bell className="h-4 w-4" />
            {hasUnreadUpdates && (
              <Badge
                variant={urgentUpdates.length > 0 ? "destructive" : "secondary"}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {recentUpdates.length > 9 ? '9+' : recentUpdates.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-96 p-0" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  System Updates
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Real-time indicator */}
                  <div className="flex items-center gap-1">
                    {isRealTimeConnected ? (
                      <Wifi className="h-3 w-3 text-green-500" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {isRealTimeConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                  
                  {/* Urgent indicator */}
                  {urgentUpdates.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {urgentUpdates.length} urgent
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {recentUpdates.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No recent updates
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-80">
                  <div className="space-y-1 p-2">
                    {recentUpdates.map((update, index) => (
                      <div
                        key={`${update.type}-${update.timestamp}-${index}`}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors",
                          update.type === 'moderation' && update.data?.change > 0 && "bg-orange-50 dark:bg-orange-950/20"
                        )}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getUpdateIcon(update.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {update.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", getUpdateColor(update.type))}
                            >
                              {update.type}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(update.timestamp)}
                            </div>
                          </div>
                          
                          {/* Additional data display */}
                          {update.data && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {update.type === 'moderation' && (
                                <span>Queue size: {update.data.count}</span>
                              )}
                              {update.type === 'analytics' && update.data.views && (
                                <span>Total views: {update.data.views.toLocaleString()}</span>
                              )}
                              {update.type === 'analytics' && update.data.searches && (
                                <span>Total searches: {update.data.searches.toLocaleString()}</span>
                              )}
                              {update.type === 'activity' && (
                                <span>Recent actions: {update.data.count}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              
              {recentUpdates.length > 0 && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setIsOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Real-time status indicator for admin dashboard
 */
export function AdminStatusIndicator({ 
  isRealTimeConnected, 
  lastUpdated,
  className 
}: { 
  isRealTimeConnected: boolean; 
  lastUpdated: number | null;
  className?: string;
}) {
  const formatLastUpdated = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      {isRealTimeConnected ? (
        <Wifi className="h-3 w-3 text-green-500" />
      ) : (
        <WifiOff className="h-3 w-3 text-red-500" />
      )}
      <span>
        {isRealTimeConnected ? 'Live updates' : 'Offline'} • Last updated: {formatLastUpdated(lastUpdated)}
      </span>
    </div>
  );
}
