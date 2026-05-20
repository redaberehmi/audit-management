import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MissionStatus } from '@prisma/client';

@Injectable()
export class MissionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, currentUserId: string) {
    const reference = await this.generateReference();

    const mission = await this.prisma.mission.create({
      data: {
        reference,
        title: dto.title,
        type: dto.type,
        scope: dto.scope,
        objectives: dto.objectives,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: MissionStatus.DRAFT,
        createdById: currentUserId,
        auditors: {
          create: dto.auditorIds?.map((uid: string, i: number) => ({
            userId: uid,
            isLead: i === 0,
          })) || [],
        },
      },
      include: this.defaultIncludes(),
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Mission',
        entityId: mission.id,
        userId: currentUserId,
        newValues: { reference, title: mission.title },
      },
    });

    return mission;
  }

  async findAll(page = 1, limit = 20, status?: string, search?: string, currentUser?: any) {
    const skip = (page - 1) * limit;
    const where: any = { isArchived: false };

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { scope: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (currentUser?.role === 'AUDITOR') {
      where.auditors = { some: { userId: currentUser.sub } };
    }

    const [total, items] = await Promise.all([
      this.prisma.mission.count({ where }),
      this.prisma.mission.findMany({
        where,
        include: { ...this.defaultIncludes(), _count: { select: { recommendations: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { id },
      include: {
        ...this.defaultIncludes(),
        recommendations: {
          include: {
            responsible: { select: { firstName: true, lastName: true } },
            direction: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        documents: { include: { uploadedBy: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!mission) throw new NotFoundException('Mission non trouvée');
    return mission;
  }

  async update(id: string, dto: any, currentUserId: string) {
    const mission = await this.prisma.mission.findUnique({ where: { id } });
    if (!mission) throw new NotFoundException('Mission non trouvée');

    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.type) updateData.type = dto.type;
    if (dto.scope) updateData.scope = dto.scope;
    if (dto.objectives) updateData.objectives = dto.objectives;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.status) updateData.status = dto.status;

    const updated = await this.prisma.mission.update({
      where: { id },
      data: updateData,
      include: this.defaultIncludes(),
    });

    await this.prisma.auditLog.create({
      data: {
        action: dto.status ? 'STATUS_CHANGE' : 'UPDATE',
        entityType: 'Mission',
        entityId: id,
        userId: currentUserId,
        missionId: id,
        newValues: { status: updated.status },
      },
    });

    return updated;
  }

  async archive(id: string, currentUserId: string) {
    const mission = await this.prisma.mission.findUnique({ where: { id } });
    if (!mission) throw new NotFoundException('Mission non trouvée');

    return this.prisma.mission.update({
      where: { id },
      data: { isArchived: true, status: MissionStatus.ARCHIVED },
    });
  }

  private async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.mission.count({
      where: { reference: { startsWith: `MISS-${year}-` } },
    });
    return `MISS-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  private defaultIncludes() {
    return {
      auditors: {
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      },
    };
  }
}
