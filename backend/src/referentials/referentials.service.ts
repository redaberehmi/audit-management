import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferentialsService {
  constructor(private prisma: PrismaService) {}

  async getDirections() {
    return this.prisma.direction.findMany({
      where: { isActive: true },
      include: { departments: { where: { isActive: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createDirection(dto: any) {
    const exists = await this.prisma.direction.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException('Code direction déjà utilisé');
    return this.prisma.direction.create({ data: dto });
  }

  async getDepartments() {
    return this.prisma.department.findMany({
      where: { isActive: true },
      include: { direction: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(dto: any) {
    const exists = await this.prisma.department.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException('Code département déjà utilisé');
    return this.prisma.department.create({ data: dto });
  }
}
