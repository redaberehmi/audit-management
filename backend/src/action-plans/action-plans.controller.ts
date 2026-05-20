import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActionPlansService } from './action-plans.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Action Plans')
@ApiBearerAuth('JWT-auth')
@Controller('action-plans')
export class ActionPlansController {
  constructor(private readonly service: ActionPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un plan d\'action' })
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.service.create(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les plans d\'actions' })
  findAll(
    @Query('recommendationId') recommendationId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser() user?: any,
  ) {
    return this.service.findAll(recommendationId, page, limit, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un plan d\'action' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un plan d\'action' })
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.service.update(id, dto, user.sub, user.role);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Ajouter un commentaire' })
  addComment(@Param('id') id: string, @Body('content') content: string, @CurrentUser('sub') userId: string) {
    return this.service.addComment(id, content, userId);
  }

  @Post(':id/deferral')
  @ApiOperation({ summary: 'Demander un report d\'échéance' })
  requestDeferral(
    @Param('id') id: string,
    @Body() dto: { deferredDate: string; reason: string },
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.requestDeferral(id, dto, userId);
  }
}
