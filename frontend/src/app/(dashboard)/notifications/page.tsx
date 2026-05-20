'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Clock, AlertTriangle, Info, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  OVERDUE: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
  RELANCE: { icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
  DEADLINE_REMINDER: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
  VALIDATION_REQUEST: { icon: CheckCheck, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  STATUS_CHANGE: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  SYSTEM: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100' },
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'À l\'instant';
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  return `Il y a ${Math.floor(seconds / 86400)}j`;
}

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => { const res = await api.get('/notifications'); return res.data.data; },
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.items || [];
  const unread = data?.unreadCount || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-500">{unread} non lue{unread > 1 ? 's' : ''}</p>}
        </div>
        {unread > 0 && (
          <button onClick={() => markAllRead.mutate()}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
            <CheckCheck size={16} /> Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400">Aucune notification</p>
          </div>
        ) : (
          notifications.map((notif: any) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
            const Icon = config.icon;
            return (
              <div key={notif.id} className={cn('flex gap-4 p-4 rounded-xl border transition', config.bg, !notif.isRead && 'ring-1 ring-blue-200')}>
                <div className={cn('p-2 rounded-lg bg-white flex-shrink-0 shadow-sm')}>
                  <Icon className={cn('w-5 h-5', config.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-800 text-sm">{notif.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                  {notif.recommendation && (
                    <span className="inline-block mt-2 text-xs font-medium text-[#1e3a5f] bg-blue-50 px-2 py-0.5 rounded-full">
                      {notif.recommendation.reference}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
