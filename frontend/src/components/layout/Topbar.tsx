'use client';

import { useRouter } from 'next/navigation';
import { Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { ROLE_LABELS } from '@/types';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export function Topbar() {
  const { user, logout, refreshToken } = useAuthStore();
  const router = useRouter();

  const { data: notifs } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=1');
      return res.data.data;
    },
    refetchInterval: 60000,
  });

  const handleLogout = async () => {
    try {
      await authService.logout(refreshToken || undefined);
    } catch {}
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h2 className="text-sm font-medium text-gray-500">
          Bienvenue,{' '}
          <span className="text-gray-800 font-semibold">
            {user?.firstName} {user?.lastName}
          </span>
        </h2>
        <p className="text-xs text-gray-400">
          {user?.role ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] : ''}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          onClick={() => router.push('/notifications')}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {notifs?.unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {notifs.unreadCount > 9 ? '9+' : notifs.unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="flex items-center gap-2 border-l pl-4">
          <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition ml-2"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
