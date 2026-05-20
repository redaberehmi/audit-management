import { PrismaClient, Role, MissionType, MissionStatus, Criticality, RecommendationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // Directions
  const directions = await Promise.all([
    prisma.direction.upsert({
      where: { code: 'DIR-FIN' },
      update: {},
      create: { code: 'DIR-FIN', name: 'Direction Financière', description: 'Gestion financière et comptabilité' },
    }),
    prisma.direction.upsert({
      where: { code: 'DIR-RH' },
      update: {},
      create: { code: 'DIR-RH', name: 'Direction des Ressources Humaines', description: 'Gestion du capital humain' },
    }),
    prisma.direction.upsert({
      where: { code: 'DIR-IT' },
      update: {},
      create: { code: 'DIR-IT', name: 'Direction des Systèmes d\'Information', description: 'Infrastructure et applications' },
    }),
    prisma.direction.upsert({
      where: { code: 'DIR-OPS' },
      update: {},
      create: { code: 'DIR-OPS', name: 'Direction des Opérations', description: 'Opérations et production' },
    }),
    prisma.direction.upsert({
      where: { code: 'DIR-COM' },
      update: {},
      create: { code: 'DIR-COM', name: 'Direction Commerciale', description: 'Ventes et marketing' },
    }),
  ]);

  console.log('✅ Directions créées:', directions.length);

  // Departments
  await Promise.all([
    prisma.department.upsert({
      where: { code: 'DEPT-COMPTA' },
      update: {},
      create: { code: 'DEPT-COMPTA', name: 'Comptabilité', directionId: directions[0].id },
    }),
    prisma.department.upsert({
      where: { code: 'DEPT-BUDGET' },
      update: {},
      create: { code: 'DEPT-BUDGET', name: 'Budget & Contrôle de Gestion', directionId: directions[0].id },
    }),
    prisma.department.upsert({
      where: { code: 'DEPT-PAIE' },
      update: {},
      create: { code: 'DEPT-PAIE', name: 'Paie & Administration', directionId: directions[1].id },
    }),
    prisma.department.upsert({
      where: { code: 'DEPT-INFRA' },
      update: {},
      create: { code: 'DEPT-INFRA', name: 'Infrastructure & Réseaux', directionId: directions[2].id },
    }),
    prisma.department.upsert({
      where: { code: 'DEPT-DEV' },
      update: {},
      create: { code: 'DEPT-DEV', name: 'Développement Applicatif', directionId: directions[2].id },
    }),
  ]);

  console.log('✅ Départements créés');

  // Users
  const hashedPassword = await bcrypt.hash('Admin@1234', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@audit.com' },
    update: {},
    create: {
      email: 'admin@audit.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Administrateur',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const dgUser = await prisma.user.upsert({
    where: { email: 'dg@audit.com' },
    update: {},
    create: {
      email: 'dg@audit.com',
      password: hashedPassword,
      firstName: 'Mohammed',
      lastName: 'Directeur Général',
      role: Role.DG,
      isActive: true,
    },
  });

  const auditManagerUser = await prisma.user.upsert({
    where: { email: 'manager.audit@audit.com' },
    update: {},
    create: {
      email: 'manager.audit@audit.com',
      password: hashedPassword,
      firstName: 'Fatima',
      lastName: 'Responsable Audit',
      role: Role.AUDIT_MANAGER,
      isActive: true,
    },
  });

  const auditorUser = await prisma.user.upsert({
    where: { email: 'auditeur@audit.com' },
    update: {},
    create: {
      email: 'auditeur@audit.com',
      password: hashedPassword,
      firstName: 'Ahmed',
      lastName: 'Auditeur',
      role: Role.AUDITOR,
      isActive: true,
      directionId: directions[0].id,
    },
  });

  const actionOwnerUser = await prisma.user.upsert({
    where: { email: 'responsable.action@audit.com' },
    update: {},
    create: {
      email: 'responsable.action@audit.com',
      password: hashedPassword,
      firstName: 'Karim',
      lastName: 'Responsable Action',
      role: Role.ACTION_OWNER,
      isActive: true,
      directionId: directions[1].id,
    },
  });

  console.log('✅ Utilisateurs créés');

  // Missions
  const mission1 = await prisma.mission.upsert({
    where: { reference: 'MISS-2024-001' },
    update: {},
    create: {
      reference: 'MISS-2024-001',
      title: 'Audit des processus financiers 2024',
      type: MissionType.FINANCIAL,
      scope: 'Direction Financière - Processus comptables et budgétaires',
      objectives: 'Évaluer la conformité des processus financiers et identifier les risques',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-31'),
      status: MissionStatus.COMPLETED,
      createdById: auditManagerUser.id,
      auditors: {
        create: [
          { userId: auditorUser.id, isLead: true },
          { userId: auditManagerUser.id, isLead: false },
        ],
      },
    },
  });

  const mission2 = await prisma.mission.upsert({
    where: { reference: 'MISS-2024-002' },
    update: {},
    create: {
      reference: 'MISS-2024-002',
      title: 'Audit des systèmes d\'information',
      type: MissionType.IT,
      scope: 'Direction IT - Infrastructure et sécurité',
      objectives: 'Évaluer la sécurité des SI et la conformité aux bonnes pratiques',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-06-30'),
      status: MissionStatus.IN_PROGRESS,
      createdById: auditManagerUser.id,
      auditors: {
        create: [
          { userId: auditorUser.id, isLead: true },
        ],
      },
    },
  });

  console.log('✅ Missions créées');

  // Recommendations
  const rec1 = await prisma.recommendation.upsert({
    where: { reference: 'REC-2024-001' },
    update: {},
    create: {
      reference: 'REC-2024-001',
      source: 'Audit Interne',
      constat: 'Les rapprochements bancaires ne sont pas effectués mensuellement',
      description: 'Mettre en place un processus de rapprochement bancaire mensuel avec validation hiérarchique',
      risk: 'Risque de fraude et d\'erreurs comptables non détectées',
      criticality: Criticality.HIGH,
      status: RecommendationStatus.IN_PROGRESS,
      progress: 60,
      dueDate: new Date('2024-12-31'),
      missionId: mission1.id,
      directionId: directions[0].id,
      responsibleId: actionOwnerUser.id,
      validatorId: auditManagerUser.id,
    },
  });

  const rec2 = await prisma.recommendation.upsert({
    where: { reference: 'REC-2024-002' },
    update: {},
    create: {
      reference: 'REC-2024-002',
      source: 'Audit Interne',
      constat: 'Absence de politique de gestion des mots de passe',
      description: 'Déployer une politique de gestion des mots de passe conforme aux normes de sécurité',
      risk: 'Risque de compromission des accès systèmes',
      criticality: Criticality.CRITICAL,
      status: RecommendationStatus.OVERDUE,
      progress: 20,
      dueDate: new Date('2024-09-30'),
      missionId: mission2.id,
      directionId: directions[2].id,
      responsibleId: actionOwnerUser.id,
      validatorId: auditManagerUser.id,
    },
  });

  const rec3 = await prisma.recommendation.upsert({
    where: { reference: 'REC-2024-003' },
    update: {},
    create: {
      reference: 'REC-2024-003',
      source: 'Commissaire aux Comptes',
      constat: 'Les fiches de paie ne sont pas archivées conformément à la réglementation',
      description: 'Mettre en place un système d\'archivage électronique sécurisé des bulletins de paie',
      risk: 'Risque de non-conformité réglementaire',
      criticality: Criticality.MEDIUM,
      status: RecommendationStatus.PLAN_TO_VALIDATE,
      progress: 40,
      dueDate: new Date('2025-03-31'),
      directionId: directions[1].id,
      responsibleId: actionOwnerUser.id,
    },
  });

  console.log('✅ Recommandations créées');

  // Action Plans
  await prisma.actionPlan.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Mise en place du processus de rapprochement',
        description: 'Définir la procédure et former les équipes au rapprochement bancaire mensuel',
        status: 'IN_PROGRESS',
        progress: 70,
        startDate: new Date('2024-07-01'),
        dueDate: new Date('2024-10-31'),
        recommendationId: rec1.id,
        ownerId: actionOwnerUser.id,
      },
      {
        title: 'Déploiement politique mots de passe',
        description: 'Configurer Active Directory et communiquer la politique aux utilisateurs',
        status: 'DRAFT',
        progress: 15,
        startDate: new Date('2024-08-01'),
        dueDate: new Date('2024-11-30'),
        recommendationId: rec2.id,
        ownerId: actionOwnerUser.id,
      },
    ],
  });

  console.log('✅ Plans d\'actions créés');

  // Notifications
  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      {
        type: 'DEADLINE_REMINDER',
        title: 'Échéance approchante',
        message: 'La recommandation REC-2024-002 est en retard. Veuillez mettre à jour le plan d\'action.',
        recipientId: actionOwnerUser.id,
        recommendationId: rec2.id,
      },
      {
        type: 'VALIDATION_REQUEST',
        title: 'Validation requise',
        message: 'Le plan d\'action de REC-2024-003 est en attente de votre validation.',
        recipientId: auditManagerUser.id,
        recommendationId: rec3.id,
      },
    ],
  });

  console.log('✅ Notifications créées');
  console.log('');
  console.log('🎉 Seed terminé avec succès!');
  console.log('');
  console.log('👤 Comptes créés:');
  console.log('  Admin:      admin@audit.com / Admin@1234');
  console.log('  DG:         dg@audit.com / Admin@1234');
  console.log('  Manager:    manager.audit@audit.com / Admin@1234');
  console.log('  Auditeur:   auditeur@audit.com / Admin@1234');
  console.log('  Responsable: responsable.action@audit.com / Admin@1234');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
