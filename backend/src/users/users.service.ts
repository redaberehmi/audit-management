import {
  Injectable, NotFoundException, ConflictException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

function excludePassword<T extends { password?: any }>(user: T): Omit<T, 'password'> {
  const { password, ...rest } = user as any;
  return rest;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto, currentUserId: string) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('Email déjà utilisé');

    const password = await bcrypt.hash(dto.password || 'Audit@2024!', 12);

    const user = await this.prisma.user.create({
      data: { ...dto, email: dto.email.toLowerCase(), password },
      include: { direction: { select: { id: true, name: true } } },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        userId: currentUserId,
        newValues: { email: user.email, role: user.role },
      },
    });

    return excludePassword(user);
  }

  async findAll(page = 1, limit = 20, search?: string, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: { direction: { select: { id: true, name: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: users.map(excludePassword),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { direction: { select: { id: true, name: true } } },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return excludePassword(user);
  }

  async update(id: string, dto: UpdateUserDto, currentUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 12);
      updateData.passwordChangedAt = new Date();
    }

    const updated = await this.prisma.user.update({ where: { id }, data: updateData });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        userId: currentUserId,
        newValues: { role: updated.role, isActive: updated.isActive },
      },
    });

    return excludePassword(updated);
  }

  async toggleActive(id: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
    return excludePassword(updated);
  }

  async resetPassword(id: string, newPassword: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashed, passwordChangedAt: new Date() },
    });
    await this.prisma.refreshToken.deleteMany({ where: { userId: id } });
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
