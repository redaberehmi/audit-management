import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Res, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { FilterRecommendationDto } from './dto/filter-recommendation.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Recommendations')
@ApiBearerAuth('JWT-auth')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.AUDIT_MANAGER, Role.AUDITOR)
  @ApiOperation({ summary: 'Créer une recommandation' })
  async create(@Body() dto: CreateRecommendationDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.sub, `${user.firstName} ${user.lastName}`);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les recommandations avec filtres' })
  async findAll(@Query() filter: FilterRecommendationDto, @CurrentUser() user: any) {
    return this.service.findAll(filter, user);
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exporter en Excel' })
  async exportExcel(@Query() filter: FilterRecommendationDto, @CurrentUser() user: any, @Res() res: Response) {
    const buffer = await this.service.exportToExcel(filter, user);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="recommandations-${Date.now()}.xlsx"`);
    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une recommandation' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.AUDIT_MANAGER, Role.AUDITOR)
  @ApiOperation({ summary: 'Mettre à jour une recommandation' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRecommendationDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.sub, `${user.firstName} ${user.lastName}`, user.role);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Changer le statut d\'une recommandation' })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: { status: string; comment?: string; progress?: number },
    @CurrentUser() user: any,
  ) {
    return this.service.update(
      id,
      { status: dto.status as any, comment: dto.comment, progress: dto.progress },
      user.sub,
      `${user.firstName} ${user.lastName}`,
      user.role,
    );
  }
}
