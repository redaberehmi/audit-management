import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RecommendationStatus, Criticality } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'dd/MM/yyyy') {
  return format(new Date(date), fmt, { locale: fr });
}

export function formatRelativeDate(date: string | Date) {
  return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: fr });
}

export function isOverdue(dueDate: string | Date) {
  return isAfter(new Date(), new Date(dueDate));
}

export function getStatusColor(status: RecommendationStatus): string {
  const colors: Record<RecommendationStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
    OPEN: 'bg-blue-100 text-blue-700 border-blue-200',
    PLAN_TO_DEFINE: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    PLAN_TO_VALIDATE: 'bg-violet-100 text-violet-700 border-violet-200',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    OVERDUE: 'bg-red-100 text-red-700 border-red-200',
    COMPLETED: 'bg-green-100 text-green-700 border-green-200',
    PENDING_VALIDATION: 'bg-purple-100 text-purple-700 border-purple-200',
    CLOSED: 'bg-gray-100 text-gray-500 border-gray-200',
    DEFERRED: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

export function getCriticalityColor(criticality: Criticality): string {
  const colors: Record<Criticality, string> = {
    LOW: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700',
  };
  return colors[criticality] || 'bg-gray-100 text-gray-600';
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount);
}

export function truncate(str: string, length = 80) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}
