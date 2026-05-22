'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, Calendar, Users, FileText, Loader2 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Modal } from '@/components/ui/modal';
import { missionsService } from '@/services/missions.service';
import { usersService } from '@/services/users.service';

const TYPE_LABELS: Record<string, string> = {
  INTERNAL: 'Interne', EXTERNAL: 'Externe', REGULATORY: 'Réglementaire',
  OPERATIONAL: 'Opérationnel', FINANCIAL: 'Financier', IT: 'Systèmes d\'Information',
};
const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon', PLANNED: 'Planifiée', IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée', ARCHIVED: 'Archivée',
};
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
  PLANNED: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  ARCHIVED: 'bg-gray-100 text-gray-400 border-gray-200',
};
const TYPE_COLORS: Record<string, string> = {
  FINANCIAL: 'bg-emerald-100 text-emerald-700', IT: 'bg-purple-100 text-purple-700',
  OPERATIONAL: 'bg-orange-100 text-orange-700', REGULATORY: 'bg-red-100 text-red-700',
  INTERNAL: 'bg-blue-100 text-blue-700', EXTERNAL: 'bg-indigo-100 text-indigo-700',
};

export default function MissionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['missions', search, statusFilter],
    queryFn: () => missionsService.findAll({ search: search || undefined, status: statusFilter || undefined }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => usersService.findAll({ limit: 100 }),
    enabled: showModal,
  });

  const auditors = (usersData?.items || []).filter((u: any) =>
    ['AUDITOR', 'AUDIT_MANAGER'].includes(u.role)
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createMission = useMutation({
    mutationFn: (data: any) => missionsService.create(data),
    onSuccess: () => {
      toast({ title: 'Mission créée avec succès' });
      qc.invalidateQueries({ queryKey: ['missions'] });
      setShowModal(false);
      reset();
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.response?.data?.message, variant: 'destructive' }),
  });

  const onSubmit = (data: any) => {
    const auditorIds = Array.isArray(data.auditorIds)
      ? data.auditorIds.filter(Boolean)
      : [data.auditorIds].filter(Boolean);
    createMission.mutate({ ...data, auditorIds });
  };

  const missions = data?.items || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Missions d'audit</h1>
          <p className="text-sm text-gray-500">{data?.pagination?.total || 0} missions</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition">
          <Plus size={16} /> Nouvelle mission
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher une mission..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="flex gap-2">
          {['IN_PROGRESS', 'PLANNED', 'COMPLETED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              className={cn('text-xs px-3 py-1.5 rounded-full border font-medium transition',
                statusFilter === s ? STATUS_COLORS[s] : 'border-gray-200 text-gray-500 hover:bg-gray-50')}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid missions */}
      {isLoading ? (
        <div className="flex justify-center py-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : missions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Aucune mission trouvée</p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 text-sm text-blue-600 hover:underline">
            Créer la première mission
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {missions.map((mission: any) => (
            <div key={mission.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#1e3a5f] font-mono">{mission.reference}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium border', STATUS_COLORS[mission.status])}>
                      {STATUS_LABELS[mission.status]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 leading-snug">{mission.title}</h3>
                </div>
                <span className={cn('text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 ml-2', TYPE_COLORS[mission.type] || 'bg-gray-100 text-gray-600')}>
                  {TYPE_LABELS[mission.type] || mission.type}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{mission.scope}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{formatDate(mission.startDate)} → {formatDate(mission.endDate)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Users size={12} />{mission.auditors?.length}</span>
                  <span className="flex items-center gap-1"><FileText size={12} />{mission._count?.recommendations || 0} rec.</span>
                </div>
              </div>
              {mission.auditors?.length > 0 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <div className="flex -space-x-2">
                    {mission.auditors.slice(0, 3).map((a: any, i: number) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-[#1e3a5f] border-2 border-white flex items-center justify-center" title={`${a.user.firstName} ${a.user.lastName}`}>
                        <span className="text-white text-[9px] font-bold">{a.user.firstName[0]}{a.user.lastName[0]}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {mission.auditors.map((a: any) => `${a.user.firstName} ${a.user.lastName}${a.isLead ? ' ★' : ''}`).join(', ')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Nouvelle Mission */}
      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="Nouvelle mission d'audit" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Titre *</label>
              <input {...register('title', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Audit des processus financiers 2025" />
              {errors.title && <p className="text-xs text-red-500 mt-1">Titre requis</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
              <select {...register('type', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Choisir...</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {errors.type && <p className="text-xs text-red-500 mt-1">Type requis</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Auditeur(s) *</label>
              <select {...register('auditorIds')} multiple
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20">
                {auditors.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Ctrl+clic pour sélection multiple</p>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Périmètre *</label>
              <input {...register('scope', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Direction Financière — Processus comptables" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Objectifs *</label>
              <textarea {...register('objectives', { required: true })} rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Décrire les objectifs de la mission..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date début *</label>
              <input {...register('startDate', { required: true })} type="date"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date fin *</label>
              <input {...register('endDate', { required: true })} type="date"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => { setShowModal(false); reset(); }}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Annuler
            </button>
            <button type="submit" disabled={createMission.isPending}
              className="px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition flex items-center gap-2 disabled:opacity-50">
              {createMission.isPending && <Loader2 size={14} className="animate-spin" />}
              Créer la mission
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
