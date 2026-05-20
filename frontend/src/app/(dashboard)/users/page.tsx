'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, UserCheck, UserX, Shield, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/types';
import { useState } from 'react';
import api from '@/lib/axios';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700', DG: 'bg-purple-100 text-purple-700',
  AUDIT_MANAGER: 'bg-blue-100 text-blue-700', AUDITOR: 'bg-indigo-100 text-indigo-700',
  ACTION_OWNER: 'bg-green-100 text-green-700',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => { const res = await api.get('/users'); return res.data.data; },
  });

  const users = (data?.items || []).filter((u: any) =>
    !search || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-500">{data?.pagination?.total || 0} utilisateurs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition">
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Utilisateur</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Rôle</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Statut</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Chargement...</td></tr>
            ) : users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{user.firstName[0]}{user.lastName[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{user.email}</td>
                <td className="px-5 py-3">
                  <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', ROLE_COLORS[user.role])}>
                    <Shield size={10} />
                    {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                    {user.isActive ? <><UserCheck size={11} /> Actif</> : <><UserX size={11} /> Inactif</>}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Modifier</button>
                    <button className={cn('text-xs px-3 py-1 rounded-lg transition', user.isActive ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'border border-green-200 text-green-600 hover:bg-green-50')}>
                      {user.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
