import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/store/AppContext';
import { Bell, Video, FileText, Gift, RefreshCw } from 'lucide-react';
import { formatTimeAgo, formatFullDate } from '@/lib/textHelpers';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

const NotificationPopover: React.FC<{ role: 'candidate' | 'recruiter' }> = ({ role }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setPage } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const roleNotifs = notifications.filter(n => n.recipientRole === role);
  const unreadCount = roleNotifs.filter(n => !n.isRead).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getIcon = (type: string) => {
    if (type === 'interview_scheduled') return <Video size={14} className="text-emerald" />;
    if (type === 'offer') return <Gift size={14} className="text-emerald" />;
    if (type === 'reapply') return <RefreshCw size={14} className="text-indigo" />;
    return <FileText size={14} className="text-muted-foreground" />;
  };

  return (
    <TooltipProvider delayDuration={300}>
    <div className="relative" ref={ref}>
      <button onClick={() => { const opening = !open; setOpen(opening); if (opening && unreadCount > 0) markAllNotificationsRead(); }} className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-notification text-primary-foreground text-[10px] font-mono-num flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[300px] bg-card border border-border rounded-xl shadow-card-hover z-50 animate-fade-up overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllNotificationsRead} className="text-xs text-indigo hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {roleNotifs.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
            ) : (
              roleNotifs.map(n => (
                <button
                  key={n.id}
                  onClick={() => { markNotificationRead(n.id); setOpen(false); }}
                  className={`w-full flex items-start gap-3 p-3 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0 ${
                    !n.isRead ? 'bg-accent border-l-2 border-l-indigo' : ''
                  }`}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed">{n.message}</p>
                    <Tooltip><TooltipTrigger asChild><p className="text-[10px] font-mono-num text-muted-foreground mt-1 cursor-default">{formatTimeAgo(n.timestamp)}</p></TooltipTrigger><TooltipContent>{formatFullDate(n.timestamp)}</TooltipContent></Tooltip>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
};

export default NotificationPopover;
