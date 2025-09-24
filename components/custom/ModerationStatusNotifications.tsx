"use client";

import React, { useState } from 'react';
import { Bell, X, Check, Clock, AlertTriangle, Archive, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ModerationStatusUpdate, getStatusColor, getStatusIcon } from '@/hooks/useModerationStatus';

export interface ModerationStatusNotificationsProps {
  className?: string;
  recentUpdates: ModerationStatusUpdate[];
  hasUnreadUpdates: boolean;
  isRealTimeConnected: boolean;
  onMarkAsRead: () => void;
}

/**
 * Real-time moderation status notifications component
 * Shows a bell icon with notification count and dropdown with recent status changes
 */
export function ModerationStatusNotifications({
  className,
  recentUpdates,
  hasUnreadUpdates,
  isRealTimeConnected,
  onMarkAsRead,
}: ModerationStatusNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && hasUnreadUpdates) {
      onMarkAsRead();
    }
  };

  const getStatusChangeIcon = (newStatus: string) => {
    switch (newStatus) {
      case 'approved':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {recentUpdates.length > 9 ? '9+' : recentUpdates.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Listing Status Updates
                </CardTitle>
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
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {recentUpdates.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No recent status updates
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-1 p-2">
                    {recentUpdates.map((update, index) => (
                      <div
                        key={`${update.listingId}-${update.timestamp}`}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusChangeIcon(update.newStatus)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {update.listingName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Status changed to
                            </span>
                            <Badge
                              variant="outline"
                              className={cn("text-xs", getStatusColor(update.newStatus))}
                            >
                              {getStatusIcon(update.newStatus)} {update.newStatus}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(update.timestamp)}
                          </p>
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
 * Compact status indicator for inline use
 */
export function StatusIndicator({ 
  status, 
  showIcon = true, 
  showText = true,
  className 
}: { 
  status: string; 
  showIcon?: boolean; 
  showText?: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs", getStatusColor(status), className)}
    >
      {showIcon && <span className="mr-1">{getStatusIcon(status)}</span>}
      {showText && status}
    </Badge>
  );
}
