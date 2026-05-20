import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ReferentialsService } from './referentials.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Referentials')
@ApiBearerAuth('JWT-auth')
@Controller('referentials')
export class ReferentialsController {
  constructor(private readonly service: ReferentialsService) {}

  @Get('directions')
  @ApiOperation({ summary: 'Lister les directions' })
  getDirections() { return this.service.getDirections(); }

  @Post('directions')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer une direction' })
  createDirection(@Body() dto: any) { return this.service.createDirection(dto); }

  @Get('departments')
  @ApiOperation({ summary: 'Lister les départements' })
  getDepartments() { return this.service.getDepartments(); }

  @Post('departments')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer un département' })
  createDepartment(@Body() dto: any) { return this.service.createDepartment(dto); }
}
