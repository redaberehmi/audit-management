'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, UserCheck, UserX, Shield, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/types';
import { Modal } from '@/components/ui/modal';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/use-toast';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700', DG: 'bg-purple-100 text-purple-700',
  AUDIT_MANAGER: 'bg-blue-100 text-blue-700', AUDITOR: 'bg-indigo-100 text-indigo-700',
  ACTION_OWNER: 'bg-green-100 text-green-700',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () => usersService.findAll({ search: search || undefined }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createUser = useMutation({
    mutationFn: (d: any) => usersService.create(d),
    onSuccess: () => {
      toast({ title: 'Utilisateur créé ✅' });
      qc.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
      reset();
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.response?.data?.message, variant: 'destructive' }),
  });

  const toggleActive = useMutation({
    mutationFn: (id: string) => usersService.toggleActive(id),
    onSuccess: () => {
      toast({ title: 'Statut mis à jour' });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
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
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition">
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

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
              <tr><td colSpan={5} className="px-5 py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></td></tr>
            ) : users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{user.firstName[0]}{user.lastName[0]}</span>
                    </div>
                    <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
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
                  <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                    {user.isActive ? <><UserCheck size={11} /> Actif</> : <><UserX size={11} /> Inactif</>}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleActive.mutate(user.id)}
                    disabled={toggleActive.isPending}
                    className={cn('text-xs px-3 py-1 rounded-lg transition border',
                      user.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50')}>
                    {user.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nouvel Utilisateur */}
      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="Nouvel utilisateur" size="md">
        <form onSubmit={handleSubmit(d => createUser.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prénom *</label>
              <input {...register('firstName', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Prénom" />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">Requis</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
              <input {...register('lastName', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de famille" />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">Requis</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
              <input {...register('email', { required: true })} type="email"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@organisation.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">Email requis</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rôle *</label>
              <select {...register('role', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Choisir...</option>
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {errors.role && <p className="text-xs text-red-500 mt-1">Requis</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe</label>
              <input {...register('password')} type="password"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Laisser vide = Audit@2024!" />
              <p className="text-xs text-gray-400 mt-1">Par défaut : Audit@2024!</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => { setShowModal(false); reset(); }}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">Annuler</button>
            <button type="submit" disabled={createUser.isPending}
              className="px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition flex items-center gap-2 disabled:opacity-50">
              {createUser.isPending && <Loader2 size={14} className="animate-spin" />}
              Créer l'utilisateur
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
