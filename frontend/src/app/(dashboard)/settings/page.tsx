'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { ROLE_LABELS } from '@/types';
import { User, Lock, Bell, Globe, Shield, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-500">Gérez votre profil et vos préférences</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon size={15} />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-gray-800">Informations personnelles</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center">
              <span className="text-white text-xl font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {user?.role ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] : ''}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Prénom', value: user?.firstName },
              { label: 'Nom', value: user?.lastName },
              { label: 'Email', value: user?.email },
              { label: 'Rôle', value: user?.role ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] : '' },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
                <input defaultValue={value || ''} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#2c5282] transition">
            <Save size={15} /> Sauvegarder
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-gray-800">Changer le mot de passe</h2>
          <div className="space-y-4">
            {['Mot de passe actuel', 'Nouveau mot de passe', 'Confirmer le nouveau mot de passe'].map((label) => (
              <div key={label}>
                <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
                <input type="password" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
              </div>
            ))}
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-xs text-blue-700">
            <Shield size={14} className="inline mr-1" />
            Le mot de passe doit contenir au minimum 8 caractères, une majuscule, un chiffre et un caractère spécial.
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#2c5282] transition">
            <Lock size={15} /> Modifier le mot de passe
          </button>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-gray-800">Préférences de notifications</h2>
          <div className="space-y-3">
            {[
              { label: 'Rappels d\'échéances (7 jours avant)', desc: 'Recevoir un email 7 jours avant l\'échéance de mes recommandations' },
              { label: 'Relances retards', desc: 'Recevoir un email de relance pour les recommandations en retard' },
              { label: 'Demandes de validation', desc: 'Être notifié quand un plan d\'action est soumis à ma validation' },
              { label: 'Changements de statut', desc: 'Recevoir les mises à jour de statut des recommandations dont je suis responsable' },
              { label: 'Escalades', desc: 'Recevoir les escalades automatiques pour retards critiques' },
            ].map(({ label, desc }, i) => (
              <div key={i} className="flex items-start justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                  <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1e3a5f]" />
                </label>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#2c5282] transition">
            <Save size={15} /> Sauvegarder les préférences
          </button>
        </div>
      )}
    </div>
  );
}
