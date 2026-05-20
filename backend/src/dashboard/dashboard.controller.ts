import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('dg')
  @Roles(Role.DG, Role.ADMIN, Role.AUDIT_MANAGER)
  @ApiOperation({ summary: 'Dashboard DG avec KPIs et graphiques' })
  async getDGDashboard(
    @Query('directionId') directionId?: string,
    @Query('year') year?: number,
  ) {
    return this.service.getDGDashboard({ directionId, year: year ? +year : undefined });
  }

  @Get('audit')
  @ApiOperation({ summary: 'Dashboard Audit pour auditeurs et managers' })
  async getAuditDashboard(@CurrentUser() user: any) {
    return this.service.getAuditDashboard(user.sub, user.role);
  }
}
