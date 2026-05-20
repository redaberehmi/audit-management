import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  // Vérification quotidienne des échéances - 8h chaque matin
  @Cron('0 8 * * *')
  async checkDeadlines() {
    this.logger.log('Vérification des échéances...');

    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Recommandations avec échéance dans 7 jours
    const approaching = await this.prisma.recommendation.findMany({
      where: {
        dueDate: { gte: today, lte: in7Days },
        status: { notIn: [RecommendationStatus.CLOSED, RecommendationStatus.OVERDUE] },
      },
      include: {
        responsible: { select: { id: true, email: true, firstName: true, lastName: true } },
        direction: { select: { name: true } },
      },
    });

    for (const rec of approaching) {
      await this.createAndSendNotification({
        type: 'DEADLINE_REMINDER',
        title: 'Rappel d\'échéance',
        message: `La recommandation ${rec.reference} arrive à échéance le ${rec.dueDate.toLocaleDateString('fr-FR')}`,
        recipientId: rec.responsibleId,
        recipientEmail: rec.responsible.email,
        recipientName: `${rec.responsible.firstName} ${rec.responsible.lastName}`,
        recommendationId: rec.id,
      });
    }

    // Recommandations en retard - relance
    const overdue = await this.prisma.recommendation.findMany({
      where: { status: RecommendationStatus.OVERDUE },
      include: {
        responsible: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    for (const rec of overdue) {
      await this.createAndSendNotification({
        type: 'RELANCE',
        title: 'Recommandation en retard - Relance',
        message: `La recommandation ${rec.reference} est en retard. Merci de mettre à jour votre plan d'action.`,
        recipientId: rec.responsibleId,
        recipientEmail: rec.responsible.email,
        recipientName: `${rec.responsible.firstName} ${rec.responsible.lastName}`,
        recommendationId: rec.id,
      });
    }

    this.logger.log(`${approaching.length} rappels et ${overdue.length} relances envoyés`);
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, items, unreadCount] = await Promise.all([
      this.prisma.notification.count({ where: { recipientId: userId } }),
      this.prisma.notification.findMany({
        where: { recipientId: userId },
        include: {
          recommendation: { select: { reference: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { recipientId: userId, isRead: false } }),
    ]);

    return { items, unreadCount, pagination: { page, limit, total } };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
  }

  async createAndSendNotification(params: {
    type: any;
    title: string;
    message: string;
    recipientId: string;
    recipientEmail?: string;
    recipientName?: string;
    recommendationId?: string;
    sentById?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        recipientId: params.recipientId,
        sentById: params.sentById,
        recommendationId: params.recommendationId,
      },
    });

    if (params.recipientEmail) {
      await this.sendEmail({
        to: params.recipientEmail,
        subject: params.title,
        html: this.buildEmailTemplate(params.title, params.message, params.recipientName),
      });

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { isSent: true, sentAt: new Date() },
      });
    }

    return notification;
  }

  private async sendEmail(options: { to: string; subject: string; html: string }) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM'),
        ...options,
      });
    } catch (error) {
      this.logger.error(`Erreur envoi email à ${options.to}: ${error.message}`);
    }
  }

  private buildEmailTemplate(title: string, message: string, recipientName?: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #1e3a5f; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { padding: 30px; }
    .message { background: #f8f9fa; border-left: 4px solid #1e3a5f; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { background: #f4f6f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .btn { display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Audit Management</h1>
      <p style="margin:5px 0;opacity:0.8;">${title}</p>
    </div>
    <div class="body">
      <p>Bonjour ${recipientName || ''},</p>
      <div class="message">${message}</div>
      <p>Connectez-vous à la plateforme pour prendre les actions nécessaires.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Audit Management Platform - Email automatique, ne pas répondre.</p>
    </div>
  </div>
</body>
</html>`;
  }
}
