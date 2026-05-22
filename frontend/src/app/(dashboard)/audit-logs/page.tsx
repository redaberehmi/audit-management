'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Création', UPDATE: 'Modification', DELETE: 'Suppression',
  STATUS_CHANGE: 'Changement statut', LOGIN: 'Connexion', LOGOUT: 'Déconnexion',
  UPLOAD: 'Upload', DOWNLOAD: 'Téléchargement', EXPORT: 'Export',
  VALIDATE: 'Validation', REJECT: 'Rejet',
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  STATUS_CHANGE: 'bg-purple-100 text-purple-700',
  LOGIN: 'bg-gray-100 text-gray-600',
  LOGOUT: 'bg-gray-100 text-gray-600',
  UPLOAD: 'bg-yellow-100 text-yellow-700',
  VALIDATE: 'bg-emerald-100 text-emerald-700',
  EXPORT: 'bg-indigo-100 text-indigo-700',
};

function formatDate(d: string) {
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, entityType, action],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '30' });
      if (entityType) params.set('entityType', entityType);
      if (action) params.set('action', action);
      const res = await api.get(`/audit-logs?${params}`);
      return res.data.data;
    },
  });

  const logs = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-[#1e3a5f]" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Journal d'audit</h1>
          <p className="text-sm text-gray-500">Traçabilité complète de toutes les actions</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
        <select value={entityType} onChange={e => { setEntityType(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Toutes entités</option>
          {['Recommendation', 'Mission', 'User', 'ActionPlan', 'Document'].map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select value={action} onChange={e => { setAction(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Toutes actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {(entityType || action) && (
          <button onClick={() => { setEntityType(''); setAction(''); setPage(1); }}
            className="text-xs text-blue-600 hover:underline px-2">
            Effacer les filtres
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Utilisateur</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Entité</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Chargement...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  Aucune entrée dans le journal
                </td></tr>
              ) : logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    {log.user ? (
                      <div>
                        <p className="font-medium text-gray-800 text-xs">{log.user.firstName} {log.user.lastName}</p>
                        <p className="text-gray-400 text-xs">{log.user.email}</p>
                      </div>
                    ) : <span className="text-gray-400 text-xs">Système</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600')}>
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-gray-700">{log.entityType}</span>
                    <p className="text-xs text-gray-400 font-mono">{log.entityId?.substring(0, 8)}...</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">
                    {log.newValues ? (
                      <span className="font-mono text-xs bg-gray-50 px-1 rounded">
                        {Object.entries(log.newValues).slice(0, 2).map(([k, v]) => `${k}=${v}`).join(', ')}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {pagination.page}/{pagination.totalPages} ({pagination.total} entrées)</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}
                className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
