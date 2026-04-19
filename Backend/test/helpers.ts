import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { UserRole } from '../src/common/enums';

/**
 * Helpers partagés par tous les tests d'intégration.
 *
 * Ces utilitaires encapsulent :
 *   - Le démarrage d'une instance NestJS complète (AppModule entier)
 *   - La remise à zéro de la BDD entre chaque test (TRUNCATE)
 *   - L'enregistrement + connexion rapide d'un utilisateur test
 */

// ============================================================================
// Démarrage de l'application
// ============================================================================

/**
 * Crée une instance NestJS de test avec la configuration identique à la prod :
 *   - Préfixe global /api
 *   - ValidationPipe strict (whitelist, transform)
 *   - Toutes les entités et migrations chargées
 *
 * À appeler une seule fois dans `beforeAll()`.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();
  return app;
}

// ============================================================================
// Remise à zéro de la base
// ============================================================================

/**
 * Vide toutes les tables de la base de test — appelé en `beforeEach` pour
 * garantir l'isolation complète entre les tests.
 *
 * Utilise TRUNCATE ... RESTART IDENTITY CASCADE pour :
 *   - Remettre les séquences BIGSERIAL à 1
 *   - Supprimer en cascade les données référencées par des foreign keys
 */
export async function truncateAllTables(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);
  const tables = dataSource.entityMetadatas.map((m) => `"${m.tableName}"`).join(', ');
  await dataSource.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
}

// ============================================================================
// Authentification rapide
// ============================================================================

export interface TestUserCredentials {
  email: string;
  username: string;
  password: string;
  role?: UserRole;
}

export interface AuthenticatedUser {
  token: string;
  userId: string;
  username: string;
  role: UserRole;
}

/**
 * Enregistre un utilisateur via POST /api/auth/register et retourne son JWT + id.
 * Raccourci très utilisé dans les setups de test pour obtenir un Bearer token.
 */
export async function registerUser(
  app: INestApplication,
  credentials: TestUserCredentials,
): Promise<AuthenticatedUser> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({
      email: credentials.email,
      username: credentials.username,
      password: credentials.password,
      role: credentials.role ?? UserRole.PLAYER,
    })
    .expect(201);

  return {
    token: response.body.accessToken,
    userId: response.body.user.id,
    username: response.body.user.username,
    role: response.body.user.role,
  };
}

/**
 * En-tête Authorization au format Bearer — sucre syntaxique.
 */
export function bearer(user: AuthenticatedUser): { Authorization: string } {
  return { Authorization: `Bearer ${user.token}` };
}

// ============================================================================
// Créations rapides d'entités (via HTTP, pas directement via le repo)
// ============================================================================

/**
 * Crée une équipe complète (avec 4 membres supplémentaires pour atteindre les
 * 5 titulaires actifs requis par la règle métier d'inscription à un tournoi).
 */
export async function createFullTeam(
  app: INestApplication,
  captain: AuthenticatedUser,
): Promise<{ teamId: string }> {
  // Le capitaine crée l'équipe
  const teamRes = await request(app.getHttpServer())
    .post('/api/teams')
    .set(bearer(captain))
    .send({ name: 'Test Team', tag: 'TST' })
    .expect(201);

  const teamId: string = teamRes.body.id;

  // 4 joueurs supplémentaires (TOP, JUNGLE, ADC, SUPPORT) — le capitaine est MID
  const roles = ['TOP', 'JUNGLE', 'ADC', 'SUPPORT'];
  for (const role of roles) {
    const player = await registerUser(app, {
      email: `${role.toLowerCase()}@test.local`,
      username: `${role.toLowerCase()}_player`,
      password: 'Password123!',
      role: UserRole.PLAYER,
    });
    await request(app.getHttpServer())
      .post(`/api/teams/${teamId}/members`)
      .set(bearer(captain))
      .send({ userId: player.userId, role, isSubstitute: false })
      .expect(201);
  }

  return { teamId };
}
