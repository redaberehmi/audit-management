import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { direction: true },
    });

    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');
    if (!user.isActive) throw new UnauthorizedException('Compte désactivé');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    return user;
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Mise à jour dernière connexion
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log connexion
    await this.prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        userId: user.id,
        ipAddress,
        userAgent,
        newValues: { email: user.email, role: user.role },
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Token de rafraîchissement invalide ou expiré');
    }

    if (!tokenRecord.user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    // Rotation du refresh token
    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    const tokens = await this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.role,
    );

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { token: refreshToken, userId },
      });
    } else {
      // Révocation de tous les tokens
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }

    await this.prisma.auditLog.create({
      data: {
        action: 'LOGOUT',
        entityType: 'User',
        entityId: userId,
        userId,
      },
    });

    return { message: 'Déconnexion réussie' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Mot de passe actuel incorrect');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    // Révocation de tous les refresh tokens
    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Mot de passe modifié avec succès' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { direction: true },
    });

    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshTokenValue = uuidv4();
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(refreshExpiresIn));

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    };
  }
}
