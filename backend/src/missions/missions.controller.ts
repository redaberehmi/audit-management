import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MissionsService } from './missions.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Missions')
@ApiBearerAuth('JWT-auth')
@Controller('missions')
export class MissionsController {
  constructor(private readonly service: MissionsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.AUDIT_MANAGER)
  @ApiOperation({ summary: 'Créer une mission d\'audit' })
  create(@Body() dto: any, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les missions' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @CurrentUser() user?: any,
  ) {
    return this.service.findAll(page, limit, status, search, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une mission' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.AUDIT_MANAGER)
  @ApiOperation({ summary: 'Mettre à jour une mission' })
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser('sub') userId: string) {
    return this.service.update(id, dto, userId);
  }

  @Patch(':id/archive')
  @Roles(Role.ADMIN, Role.AUDIT_MANAGER)
  @ApiOperation({ summary: 'Archiver une mission' })
  archive(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.archive(id, userId);
  }
}
