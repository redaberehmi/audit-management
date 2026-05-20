import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  // Railway injecte PORT dynamiquement — on l'écoute en priorité
  const port = process.env.PORT || configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

  // CORS — accepte aussi les domaines Vercel et Railway dynamiques
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    /\.vercel\.app$/,
    /\.railway\.app$/,
    /\.up\.railway\.app$/,
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Préfixe API global
  app.setGlobalPrefix('api');

  // Taille max des requêtes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtres et intercepteurs globaux
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Swagger Documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Audit Management API')
      .setDescription('API REST pour la plateforme de gestion des audits, recommandations et plans d\'actions')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentification et gestion des sessions')
      .addTag('Users', 'Gestion des utilisateurs')
      .addTag('Missions', 'Gestion des missions d\'audit')
      .addTag('Recommendations', 'Gestion des recommandations')
      .addTag('Action Plans', 'Gestion des plans d\'actions')
      .addTag('Dashboard', 'Tableaux de bord et KPIs')
      .addTag('Reports', 'Rapports et exports')
      .addTag('Documents', 'Gestion documentaire')
      .addTag('Referentials', 'Référentiels métier')
      .addTag('Notifications', 'Notifications et alertes')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // Écoute sur 0.0.0.0 obligatoire pour Railway/Docker
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 Backend démarré sur: http://0.0.0.0:${port}`, 'Bootstrap');
  Logger.log(`📚 Swagger: http://0.0.0.0:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
