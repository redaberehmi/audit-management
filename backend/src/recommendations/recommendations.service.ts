import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { FilterRecommendationDto } from './dto/filter-recommendation.dto';
import { RecommendationStatus, Role, Criticality } from '@prisma/client';
import * as ExcelJS from 'exceljs';

// Transitions de statuts autorisées
const ALLOWED_TRANSITIONS: Partial<Record<RecommendationStatus, RecommendationStatus[]>> = {
  DRAFT: [RecommendationStatus.OPEN],
  OPEN: [RecommendationStatus.PLAN_TO_DEFINE],
  PLAN_TO_DEFINE: [RecommendationStatus.PLAN_TO_VALIDATE],
  PLAN_TO_VALIDATE: [RecommendationStatus.IN_PROGRESS, RecommendationStatus.PLAN_TO_DEFINE],
  IN_PROGRESS: [RecommendationStatus.COMPLETED, RecommendationStatus.OVERDUE, RecommendationStatus.DEFERRED],
  OVERDUE: [RecommendationStatus.IN_PROGRESS, RecommendationStatus.DEFERRED],
  COMPLETED: [RecommendationStatus.PENDING_VALIDATION],
  PENDING_VALIDATION: [RecommendationStatus.CLOSED, RecommendationStatus.IN_PROGRESS],
  DEFERRED: [RecommendationStatus.IN_PROGRESS],
};

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRecommendationDto, currentUserId: string, currentUserName: string) {
    const reference = await this.generateReference();

    const recommendation = await this.prisma.recommendation.create({
      data: {
        reference,
        source: dto.source,
        constat: dto.constat,
        description: dto.description,
        risk: dto.risk,
        criticality: dto.criticality,
        dueDate: new Date(dto.dueDate),
        missionId: dto.missionId,
        directionId: dto.directionId,
        departmentId: dto.departmentId,
        responsibleId: dto.responsibleId,
        validatorId: dto.validatorId,
        status: RecommendationStatus.DRAFT,
      },
      include: this.defaultIncludes(),
    });

    await this.logHistory(recommendation.id, null, RecommendationStatus.DRAFT, null, null, currentUserId, currentUserName, 'Création');

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Recommendation',
        entityId: recommendation.id,
        userId: currentUserId,
        newValues: { reference, status: 'DRAFT' },
      },
    });

    return recommendation;
  }

  async findAll(filter: FilterRecommendationDto, currentUser: any) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = filter;
    const skip = (page - 1) * limit;

    const where: any = { isArchived: false };

    if (filters.search) {
      where.OR = [
        { reference: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { constat: { contains: filters.search, mode: 'insensitive' } },
        { source: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.status) where.status = filters.status;
    if (filters.criticality) where.criticality = filters.criticality;
    if (filters.directionId) where.directionId = filters.directionId;
    if (filters.missionId) where.missionId = filters.missionId;

    // Restriction selon le rôle
    if (currentUser.role === Role.ACTION_OWNER) {
      where.responsibleId = currentUser.sub;
    } else if (currentUser.role === Role.AUDITOR) {
      where.mission = { auditors: { some: { userId: currentUser.sub } } };
    }

    if (filters.responsibleId) where.responsibleId = filters.responsibleId;

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.gte = new Date(filters.dueDateFrom);
      if (filters.dueDateTo) where.dueDate.lte = new Date(filters.dueDateTo);
    }

    const [total, items] = await Promise.all([
      this.prisma.recommendation.count({ where }),
      this.prisma.recommendation.findMany({
        where,
        include: this.defaultIncludes(),
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id },
      include: {
        ...this.defaultIncludes(),
        comments: {
          include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        history: { orderBy: { createdAt: 'desc' }, take: 20 },
        actionPlans: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true } },
            comments: { include: { author: { select: { id: true, firstName: true, lastName: true } } } },
          },
        },
      },
    });

    if (!recommendation) throw new NotFoundException('Recommandation non trouvée');
    return recommendation;
  }

  async update(id: string, dto: UpdateRecommendationDto, currentUserId: string, currentUserName: string, currentUserRole: Role) {
    const recommendation = await this.prisma.recommendation.findUnique({ where: { id } });
    if (!recommendation) throw new NotFoundException('Recommandation non trouvée');

    // Vérification transition de statut
    if (dto.status && dto.status !== recommendation.status) {
      this.validateStatusTransition(recommendation.status, dto.status, currentUserRole);
    }

    const updateData: any = { ...dto };
    if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate);
    if (dto.status === RecommendationStatus.CLOSED) updateData.closedAt = new Date();

    delete updateData.comment;

    const updated = await this.prisma.recommendation.update({
      where: { id },
      data: updateData,
      include: this.defaultIncludes(),
    });

    if (dto.status && dto.status !== recommendation.status) {
      await this.logHistory(
        id, recommendation.status, dto.status,
        recommendation.progress, dto.progress,
        currentUserId, currentUserName, dto.comment,
      );
    }

    await this.prisma.auditLog.create({
      data: {
        action: dto.status ? 'STATUS_CHANGE' : 'UPDATE',
        entityType: 'Recommendation',
        entityId: id,
        userId: currentUserId,
        oldValues: { status: recommendation.status, progress: recommendation.progress },
        newValues: { status: updated.status, progress: updated.progress },
      },
    });

    return updated;
  }

  async updateOverdueRecommendations() {
    const today = new Date();
    const result = await this.prisma.recommendation.updateMany({
      where: {
        dueDate: { lt: today },
        status: { in: [RecommendationStatus.IN_PROGRESS, RecommendationStatus.OPEN, RecommendationStatus.PLAN_TO_VALIDATE] },
      },
      data: { status: RecommendationStatus.OVERDUE },
    });
    this.logger.log(`${result.count} recommandations passées en OVERDUE`);
    return result;
  }

  async exportToExcel(filter: FilterRecommendationDto, currentUser: any): Promise<Buffer> {
    const { items } = await this.findAll({ ...filter, limit: 10000, page: 1 }, currentUser);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Recommandations');

    sheet.columns = [
      { header: 'Référence', key: 'reference', width: 15 },
      { header: 'Source', key: 'source', width: 20 },
      { header: 'Constat', key: 'constat', width: 40 },
      { header: 'Recommandation', key: 'description', width: 50 },
      { header: 'Risque', key: 'risk', width: 30 },
      { header: 'Criticité', key: 'criticality', width: 12 },
      { header: 'Statut', key: 'status', width: 20 },
      { header: 'Avancement (%)', key: 'progress', width: 15 },
      { header: 'Direction', key: 'direction', width: 25 },
      { header: 'Responsable', key: 'responsible', width: 25 },
      { header: 'Échéance', key: 'dueDate', width: 15 },
      { header: 'Mission', key: 'mission', width: 30 },
    ];

    // Style entête
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1e3a5f' } };

    items.forEach((rec: any) => {
      sheet.addRow({
        reference: rec.reference,
        source: rec.source,
        constat: rec.constat,
        description: rec.description,
        risk: rec.risk,
        criticality: rec.criticality,
        status: rec.status,
        progress: rec.progress,
        direction: rec.direction?.name || '',
        responsible: `${rec.responsible?.firstName} ${rec.responsible?.lastName}`,
        dueDate: rec.dueDate ? new Date(rec.dueDate).toLocaleDateString('fr-FR') : '',
        mission: rec.mission?.title || '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private validateStatusTransition(currentStatus: RecommendationStatus, newStatus: RecommendationStatus, role: Role) {
    // Admin et AUDIT_MANAGER peuvent faire toutes les transitions
    if (role === Role.ADMIN || role === Role.AUDIT_MANAGER) return;

    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transition de statut invalide: ${currentStatus} → ${newStatus}`,
      );
    }
  }

  private async logHistory(
    recommendationId: string,
    previousStatus: RecommendationStatus | null,
    newStatus: RecommendationStatus,
    previousProgress: number | null,
    newProgress: number | null | undefined,
    changedById: string,
    changedByName: string,
    comment?: string,
  ) {
    await this.prisma.recommendationHistory.create({
      data: {
        recommendationId,
        previousStatus,
        newStatus,
        previousProgress,
        newProgress: newProgress ?? null,
        changedById,
        changedByName,
        comment,
      },
    });
  }

  private async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.recommendation.count({
      where: { reference: { startsWith: `REC-${year}-` } },
    });
    return `REC-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  private defaultIncludes() {
    return {
      mission: { select: { id: true, reference: true, title: true, type: true } },
      direction: { select: { id: true, name: true, code: true } },
      department: { select: { id: true, name: true } },
      responsible: { select: { id: true, firstName: true, lastName: true, email: true } },
      validator: { select: { id: true, firstName: true, lastName: true, email: true } },
    };
  }
}
