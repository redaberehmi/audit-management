export type Role = 'ADMIN' | 'AUDIT_MANAGER' | 'AUDITOR' | 'ACTION_OWNER' | 'DG';

export type RecommendationStatus =
  | 'DRAFT' | 'OPEN' | 'PLAN_TO_DEFINE' | 'PLAN_TO_VALIDATE'
  | 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED' | 'PENDING_VALIDATION'
  | 'CLOSED' | 'DEFERRED';

export type Criticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type MissionStatus = 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export type ActionPlanStatus = 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DEFERRED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  directionId?: string;
  direction?: Direction;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Direction {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  directionId: string;
  direction?: Direction;
}

export interface Mission {
  id: string;
  reference: string;
  title: string;
  type: string;
  scope: string;
  objectives: string;
  startDate: string;
  endDate: string;
  status: MissionStatus;
  isArchived: boolean;
  auditors: MissionAuditor[];
  _count?: { recommendations: number };
  createdAt: string;
}

export interface MissionAuditor {
  id: string;
  userId: string;
  isLead: boolean;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface Recommendation {
  id: string;
  reference: string;
  source: string;
  constat: string;
  description: string;
  risk: string;
  criticality: Criticality;
  status: RecommendationStatus;
  progress: number;
  dueDate: string;
  closedAt?: string;
  missionId?: string;
  mission?: Pick<Mission, 'id' | 'reference' | 'title' | 'type'>;
  directionId: string;
  direction?: Pick<Direction, 'id' | 'name' | 'code'>;
  responsibleId: string;
  responsible?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  validatorId?: string;
  validator?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  actionPlans?: ActionPlan[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  status: ActionPlanStatus;
  progress: number;
  startDate: string;
  dueDate: string;
  completedAt?: string;
  deferredDate?: string;
  deferralReason?: string;
  recommendationId: string;
  recommendation?: Pick<Recommendation, 'id' | 'reference' | 'description' | 'criticality'>;
  ownerId: string;
  owner?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  comments?: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  isSent: boolean;
  sentAt?: string;
  recipientId: string;
  recommendationId?: string;
  recommendation?: Pick<Recommendation, 'reference' | 'status'>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const STATUS_LABELS: Record<RecommendationStatus, string> = {
  DRAFT: 'Brouillon',
  OPEN: 'Ouverte',
  PLAN_TO_DEFINE: 'Plan à définir',
  PLAN_TO_VALIDATE: 'Plan à valider',
  IN_PROGRESS: 'En cours',
  OVERDUE: 'En retard',
  COMPLETED: 'Réalisée',
  PENDING_VALIDATION: 'En attente validation',
  CLOSED: 'Clôturée',
  DEFERRED: 'Reportée',
};

export const CRITICALITY_LABELS: Record<Criticality, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyenne',
  HIGH: 'Élevée',
  CRITICAL: 'Critique',
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrateur',
  AUDIT_MANAGER: 'Responsable Audit',
  AUDITOR: 'Auditeur',
  ACTION_OWNER: 'Responsable Action',
  DG: 'Directeur Général',
};
