import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationStatus, Criticality, Role } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDGDashboard(filters?: { directionId?: string; year?: number }) {
    const year = filters?.year || new Date().getFullYear();
    const yearStart = new Date(`${year}-01-01`);
    const yearEnd = new Date(`${year}-12-31`);

    const baseWhere: any = { isArchived: false };
    if (filters?.directionId) baseWhere.directionId = filters.directionId;

    const [
      totalRecs,
      openRecs,
      overdueRecs,
      criticalRecs,
      closedRecs,
      inProgressRecs,
      byDirection,
      byCriticality,
      byStatus,
      monthlyEvolution,
      upcomingDeadlines,
      recentActivity,
    ] = await Promise.all([
      // Total
      this.prisma.recommendation.count({ where: baseWhere }),
      // Ouvertes
      this.prisma.recommendation.count({
        where: { ...baseWhere, status: { notIn: [RecommendationStatus.CLOSED] } },
      }),
      // En retard
      this.prisma.recommendation.count({
        where: { ...baseWhere, status: RecommendationStatus.OVERDUE },
      }),
      // Critiques
      this.prisma.recommendation.count({
        where: { ...baseWhere, criticality: Criticality.CRITICAL, status: { not: RecommendationStatus.CLOSED } },
      }),
      // Clôturées
      this.prisma.recommendation.count({
        where: { ...baseWhere, status: RecommendationStatus.CLOSED },
      }),
      // En cours
      this.prisma.recommendation.count({
        where: { ...baseWhere, status: RecommendationStatus.IN_PROGRESS },
      }),
      // Par direction
      this.prisma.recommendation.groupBy({
        by: ['directionId'],
        where: baseWhere,
        _count: { id: true },
      }),
      // Par criticité
      this.prisma.recommendation.groupBy({
        by: ['criticality'],
        where: { ...baseWhere, status: { not: RecommendationStatus.CLOSED } },
        _count: { id: true },
      }),
      // Par statut
      this.prisma.recommendation.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { id: true },
      }),
      // Évolution mensuelle
      this.getMonthlyEvolution(year, baseWhere),
      // Échéances prochaines (30 jours)
      this.prisma.recommendation.findMany({
        where: {
          ...baseWhere,
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          status: { notIn: [RecommendationStatus.CLOSED, RecommendationStatus.OVERDUE] },
        },
        include: {
          direction: { select: { name: true } },
          responsible: { select: { firstName: true, lastName: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      // Activité récente
      this.prisma.auditLog.findMany({
        where: { entityType: 'Recommendation' },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Enrichir les directions
    const directionIds = byDirection.map((d) => d.directionId).filter(Boolean);
    const directionDetails = await this.prisma.direction.findMany({
      where: { id: { in: directionIds } },
      select: { id: true, name: true },
    });
    const directionMap = new Map(directionDetails.map((d) => [d.id, d.name]));

    const taux_cloture = totalRecs > 0 ? Math.round((closedRecs / totalRecs) * 100) : 0;

    return {
      kpis: {
        total: totalRecs,
        open: openRecs,
        overdue: overdueRecs,
        critical: criticalRecs,
        closed: closedRecs,
        inProgress: inProgressRecs,
        tauxCloture: taux_cloture,
        tauxRetard: openRecs > 0 ? Math.round((overdueRecs / openRecs) * 100) : 0,
      },
      charts: {
        byDirection: byDirection.map((d) => ({
          directionId: d.directionId,
          name: directionMap.get(d.directionId) || 'Inconnue',
          count: d._count.id,
        })),
        byCriticality: byCriticality.map((c) => ({
          criticality: c.criticality,
          count: c._count.id,
        })),
        byStatus: byStatus.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        monthlyEvolution,
      },
      upcomingDeadlines,
      recentActivity,
    };
  }

  async getAuditDashboard(userId: string, userRole: Role) {
    const userFilter = userRole === Role.AUDITOR
      ? { mission: { auditors: { some: { userId } } } }
      : {};

    const [
      totalMissions,
      activeMissions,
      pendingValidations,
      overdueRecs,
      totalRecs,
      myActionPlans,
    ] = await Promise.all([
      this.prisma.mission.count({ where: { isArchived: false } }),
      this.prisma.mission.count({ where: { isArchived: false, status: 'IN_PROGRESS' } }),
      this.prisma.recommendation.count({
        where: { status: RecommendationStatus.PENDING_VALIDATION, validatorId: userId },
      }),
      this.prisma.recommendation.count({
        where: { ...userFilter, status: RecommendationStatus.OVERDUE },
      }),
      this.prisma.recommendation.count({ where: { ...userFilter, isArchived: false } }),
      this.prisma.actionPlan.count({
        where: { ownerId: userId, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      }),
    ]);

    const recentMissions = await this.prisma.mission.findMany({
      where: { isArchived: false },
      include: {
        auditors: { include: { user: { select: { firstName: true, lastName: true } } } },
        _count: { select: { recommendations: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    return {
      kpis: {
        totalMissions,
        activeMissions,
        pendingValidations,
        overdueRecs,
        totalRecs,
        myActionPlans,
      },
      recentMissions,
    };
  }

  private async getMonthlyEvolution(year: number, baseWhere: any) {
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0);

      const [created, closed] = await Promise.all([
        this.prisma.recommendation.count({
          where: { ...baseWhere, createdAt: { gte: start, lte: end } },
        }),
        this.prisma.recommendation.count({
          where: { ...baseWhere, closedAt: { gte: start, lte: end } },
        }),
      ]);

      months.push({
        month: m,
        label: new Date(year, m - 1).toLocaleString('fr-FR', { month: 'short' }),
        created,
        closed,
      });
    }
    return months;
  }
}
