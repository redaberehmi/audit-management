import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('monthly/excel')
  @Roles(Role.ADMIN, Role.AUDIT_MANAGER, Role.DG)
  @ApiOperation({ summary: 'Rapport mensuel Excel' })
  async monthlyExcel(
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('directionId') directionId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.service.generateMonthlyReport(+year || new Date().getFullYear(), +month || new Date().getMonth() + 1, directionId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="rapport-mensuel-${year}-${month}.xlsx"`);
    res.send(buffer);
  }

  @Get('monthly/pdf')
  @Roles(Role.ADMIN, Role.AUDIT_MANAGER, Role.DG)
  @ApiOperation({ summary: 'Rapport mensuel PDF' })
  async monthlyPdf(
    @Query('year') year: number,
    @Query('month') month: number,
    @Res() res: Response,
  ) {
    const buffer = await this.service.generatePdfReport(+year || new Date().getFullYear(), +month || new Date().getMonth() + 1);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapport-mensuel-${year}-${month}.pdf"`);
    res.send(buffer);
  }
}
