import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { RecommendationStatus, Criticality } from '@prisma/client';
import { Readable } from 'stream';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateMonthlyReport(year: number, month: number, directionId?: string): Promise<Buffer> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const where: any = { isArchived: false };
    if (directionId) where.directionId = directionId;

    const [newRecs, closedRecs, overdueRecs, byDirection, byCriticality] = await Promise.all([
      this.prisma.recommendation.findMany({
        where: { ...where, createdAt: { gte: startDate, lte: endDate } },
        include: {
          direction: { select: { name: true } },
          responsible: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.recommendation.findMany({
        where: { ...where, closedAt: { gte: startDate, lte: endDate } },
        include: { direction: { select: { name: true } } },
      }),
      this.prisma.recommendation.findMany({
        where: { ...where, status: RecommendationStatus.OVERDUE },
        include: {
          direction: { select: { name: true } },
          responsible: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.recommendation.groupBy({
        by: ['directionId'],
        where,
        _count: { id: true },
      }),
      this.prisma.recommendation.groupBy({
        by: ['criticality'],
        where: { ...where, status: { not: RecommendationStatus.CLOSED } },
        _count: { id: true },
      }),
    ]);

    const workbook = new ExcelJS.Workbook();

    // Feuille synthèse
    const synthSheet = workbook.addWorksheet('Synthèse');
    synthSheet.mergeCells('A1:D1');
    const titleCell = synthSheet.getCell('A1');
    titleCell.value = `Rapport Mensuel - ${new Date(year, month - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`;
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1e3a5f' } };
    titleCell.alignment = { horizontal: 'center' };
    synthSheet.getRow(1).height = 40;

    synthSheet.addRow([]);
    synthSheet.addRow(['Indicateur', 'Valeur']);
    synthSheet.addRow(['Nouvelles recommandations', newRecs.length]);
    synthSheet.addRow(['Recommandations clôturées', closedRecs.length]);
    synthSheet.addRow(['Recommandations en retard', overdueRecs.length]);
    synthSheet.addRow(['Taux de clôture mensuel', `${newRecs.length > 0 ? Math.round((closedRecs.length / newRecs.length) * 100) : 0}%`]);

    // Feuille détail nouvelles recommandations
    const newSheet = workbook.addWorksheet('Nouvelles Recommandations');
    newSheet.columns = [
      { header: 'Référence', key: 'ref', width: 15 },
      { header: 'Source', key: 'source', width: 20 },
      { header: 'Description', key: 'desc', width: 50 },
      { header: 'Criticité', key: 'crit', width: 12 },
      { header: 'Direction', key: 'dir', width: 25 },
      { header: 'Responsable', key: 'resp', width: 25 },
      { header: 'Échéance', key: 'due', width: 15 },
    ];
    newSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    newSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1e3a5f' } };

    newRecs.forEach((r: any) => {
      newSheet.addRow({
        ref: r.reference,
        source: r.source,
        desc: r.description,
        crit: r.criticality,
        dir: r.direction?.name || '',
        resp: `${r.responsible?.firstName} ${r.responsible?.lastName}`,
        due: r.dueDate ? new Date(r.dueDate).toLocaleDateString('fr-FR') : '',
      });
    });

    // Feuille retards
    const overdueSheet = workbook.addWorksheet('Retards');
    overdueSheet.columns = [
      { header: 'Référence', key: 'ref', width: 15 },
      { header: 'Description', key: 'desc', width: 50 },
      { header: 'Criticité', key: 'crit', width: 12 },
      { header: 'Direction', key: 'dir', width: 25 },
      { header: 'Responsable', key: 'resp', width: 25 },
      { header: 'Échéance initiale', key: 'due', width: 15 },
      { header: 'Avancement (%)', key: 'prog', width: 15 },
    ];
    overdueSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    overdueSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'c0392b' } };

    overdueRecs.forEach((r: any) => {
      overdueSheet.addRow({
        ref: r.reference,
        desc: r.description,
        crit: r.criticality,
        dir: r.direction?.name || '',
        resp: `${r.responsible?.firstName} ${r.responsible?.lastName}`,
        due: r.dueDate ? new Date(r.dueDate).toLocaleDateString('fr-FR') : '',
        prog: r.progress,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generatePdfReport(year: number, month: number): Promise<Buffer> {
    const startDate = new Date(year, month - 1, 1);
    const monthName = new Date(year, month - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    const [total, closed, overdue, critical] = await Promise.all([
      this.prisma.recommendation.count({ where: { isArchived: false } }),
      this.prisma.recommendation.count({ where: { status: RecommendationStatus.CLOSED } }),
      this.prisma.recommendation.count({ where: { status: RecommendationStatus.OVERDUE } }),
      this.prisma.recommendation.count({
        where: { criticality: Criticality.CRITICAL, status: { not: RecommendationStatus.CLOSED } },
      }),
    ]);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.rect(0, 0, doc.page.width, 120).fill('#1e3a5f');
      doc.fillColor('white').fontSize(24).font('Helvetica-Bold')
        .text('AUDIT MANAGEMENT', 50, 30);
      doc.fontSize(16).font('Helvetica')
        .text(`Rapport Mensuel - ${monthName}`, 50, 65);
      doc.fontSize(12)
        .text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 50, 90);

      // KPIs
      doc.fillColor('#1e3a5f').fontSize(18).font('Helvetica-Bold')
        .text('Indicateurs Clés', 50, 150);
      doc.moveTo(50, 175).lineTo(doc.page.width - 50, 175).strokeColor('#1e3a5f').lineWidth(2).stroke();

      const kpis = [
        { label: 'Total Recommandations', value: total, color: '#2c3e50' },
        { label: 'Clôturées', value: closed, color: '#27ae60' },
        { label: 'En Retard', value: overdue, color: '#e74c3c' },
        { label: 'Critiques Actives', value: critical, color: '#e67e22' },
        { label: 'Taux de Clôture', value: `${total > 0 ? Math.round((closed / total) * 100) : 0}%`, color: '#3498db' },
      ];

      let yPos = 190;
      kpis.forEach((kpi, i) => {
        const x = i % 2 === 0 ? 50 : 300;
        if (i % 2 === 0 && i > 0) yPos += 80;

        doc.rect(x, yPos, 220, 65).fill(kpi.color).stroke();
        doc.fillColor('white').fontSize(14).font('Helvetica-Bold')
          .text(String(kpi.value), x + 10, yPos + 10);
        doc.fontSize(11).font('Helvetica')
          .text(kpi.label, x + 10, yPos + 35);
      });

      doc.end();
    });
  }
}
