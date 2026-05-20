import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  private readonly uploadDir: string;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.uploadDir = config.get<string>('UPLOAD_DIR', './uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(
    file: Express.Multer.File,
    dto: { type?: any; missionId?: string; recommendationId?: string; actionPlanId?: string },
    uploadedById: string,
  ) {
    const document = await this.prisma.document.create({
      data: {
        name: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        type: dto.type || 'OTHER',
        uploadedById,
        missionId: dto.missionId,
        recommendationId: dto.recommendationId,
        actionPlanId: dto.actionPlanId,
      },
      include: { uploadedBy: { select: { firstName: true, lastName: true } } },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPLOAD',
        entityType: 'Document',
        entityId: document.id,
        userId: uploadedById,
        newValues: { name: file.originalname, size: file.size },
      },
    });

    return document;
  }

  async findAll(filters: { missionId?: string; recommendationId?: string; actionPlanId?: string }) {
    return this.prisma.document.findMany({
      where: {
        missionId: filters.missionId,
        recommendationId: filters.recommendationId,
        actionPlanId: filters.actionPlanId,
      },
      include: { uploadedBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFilePath(id: string): Promise<{ filePath: string; document: any }> {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException('Document non trouvé');
    if (!fs.existsSync(document.path)) throw new NotFoundException('Fichier non trouvé sur le serveur');
    return { filePath: document.path, document };
  }

  async delete(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException('Document non trouvé');

    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    return this.prisma.document.delete({ where: { id } });
  }
}
