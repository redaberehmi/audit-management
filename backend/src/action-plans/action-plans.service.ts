import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActionPlanStatus, Role } from '@prisma/client';

@Injectable()
export class ActionPlansService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, currentUserId: string) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: dto.recommendationId },
    });
    if (!recommendation) throw new NotFoundException('Recommandation non trouvée');

    return this.prisma.actionPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        dueDate: new Date(dto.dueDate),
        status: ActionPlanStatus.DRAFT,
        recommendationId: dto.recommendationId,
        ownerId: dto.ownerId || currentUserId,
      },
      include: this.defaultIncludes(),
    });
  }

  async findAll(recommendationId?: string, page = 1, limit = 20, currentUser?: any) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (recommendationId) where.recommendationId = recommendationId;
    if (currentUser?.role === Role.ACTION_OWNER) where.ownerId = currentUser.sub;

    const [total, items] = await Promise.all([
      this.prisma.actionPlan.count({ where }),
      this.prisma.actionPlan.findMany({
        where,
        include: this.defaultIncludes(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { items, pagination: { page, limit, total } };
  }

  async findOne(id: string) {
    const plan = await this.prisma.actionPlan.findUnique({
      where: { id },
      include: {
        ...this.defaultIncludes(),
        comments: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        documents: true,
      },
    });
    if (!plan) throw new NotFoundException('Plan d\'action non trouvé');
    return plan;
  }

  async update(id: string, dto: any, currentUserId: string, currentUserRole: Role) {
    const plan = await this.prisma.actionPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan d\'action non trouvé');

    if (currentUserRole === Role.ACTION_OWNER && plan.ownerId !== currentUserId) {
      throw new BadRequestException('Accès non autorisé à ce plan d\'action');
    }

    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.description) updateData.description = dto.description;
    if (dto.status) updateData.status = dto.status;
    if (dto.progress !== undefined) updateData.progress = dto.progress;
    if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate);
    if (dto.deferredDate) updateData.deferredDate = new Date(dto.deferredDate);
    if (dto.deferralReason) updateData.deferralReason = dto.deferralReason;
    if (dto.status === ActionPlanStatus.COMPLETED) updateData.completedAt = new Date();

    return this.prisma.actionPlan.update({
      where: { id },
      data: updateData,
      include: this.defaultIncludes(),
    });
  }

  async addComment(planId: string, content: string, authorId: string) {
    const plan = await this.prisma.actionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan d\'action non trouvé');

    return this.prisma.comment.create({
      data: { content, authorId, actionPlanId: planId },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async requestDeferral(id: string, dto: { deferredDate: string; reason: string }, currentUserId: string) {
    return this.update(
      id,
      {
        status: ActionPlanStatus.DEFERRED,
        deferredDate: dto.deferredDate,
        deferralReason: dto.reason,
      },
      currentUserId,
      Role.ACTION_OWNER,
    );
  }

  private defaultIncludes() {
    return {
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      recommendation: { select: { id: true, reference: true, description: true, criticality: true } },
    };
  }
}
