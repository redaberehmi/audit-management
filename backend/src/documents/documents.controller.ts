import {
  Controller, Post, Get, Delete, Param, Query, Body,
  UseInterceptors, UploadedFile, Res, StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { DocumentsService } from './documents.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

@ApiTags('Documents')
@ApiBearerAuth('JWT-auth')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Uploader un document' })
  @UseInterceptors(FileInterceptor('file', { storage, limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: any,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.upload(file, dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les documents' })
  findAll(
    @Query('missionId') missionId?: string,
    @Query('recommendationId') recommendationId?: string,
    @Query('actionPlanId') actionPlanId?: string,
  ) {
    return this.service.findAll({ missionId, recommendationId, actionPlanId });
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Télécharger un document' })
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const { filePath, document } = await this.service.getFilePath(id);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);
    const stream = fs.createReadStream(filePath);
    return new StreamableFile(stream);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un document' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
