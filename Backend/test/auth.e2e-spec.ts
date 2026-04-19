import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { UserRole } from '../src/common/enums';
import { createTestApp, truncateAllTables, registerUser } from './helpers';

/**
 * Tests d'intégration — module Auth
 *
 * Scénarios couverts :
 *   • POST /api/auth/register         — création d'un nouveau compte + retour JWT
 *   • POST /api/auth/login            — authentification par email ou username
 *   • POST /api/auth/forgot-password  — stub V2 renvoyant 501 Not Implemented
 *
 * Ces tests vérifient l'intégration complète :
 *   HTTP → Controller → ValidationPipe → Service → Bcrypt → TypeORM → PostgreSQL.
 *
 * Total : 3 endpoints × 2+ cas = 8 cas de test.
 */
describe('Auth (intégration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Réinitialisation complète de la base avant chaque test
    await truncateAllTables(app);
  });

  // ==========================================================================
  // POST /api/auth/register
  // ==========================================================================
  describe('POST /api/auth/register', () => {
    const nouveauCompte = {
      email: 'alice@dpscheck.local',
      username: 'alice_mid',
      password: 'Password123!',
      role: UserRole.PLAYER,
    };

    it('[NOMINAL] devrait créer un nouveau compte et retourner un JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(nouveauCompte)
        .expect(201);

      // Le token doit être un JWT à 3 segments (header.payload.signature)
      expect(res.body.accessToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      expect(res.body.user).toMatchObject({
        email: 'alice@dpscheck.local',
        username: 'alice_mid',
        role: UserRole.PLAYER,
      });
      expect(res.body.user.id).toBeDefined();
      // Le hash du mot de passe ne doit JAMAIS être exposé en réponse
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it("[ERREUR] devrait retourner 409 Conflict si l'email est déjà pris", async () => {
      // Arrange — premier enregistrement réussi
      await registerUser(app, nouveauCompte);

      // Act — tentative de doublon sur le même email
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(nouveauCompte)
        .expect(409);

      expect(res.body.message).toMatch(/already exists/i);
    });

    it('[ERREUR] devrait retourner 400 Bad Request si le mot de passe est trop faible', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...nouveauCompte, password: 'weak' })
        .expect(400);

      expect(res.body.message).toEqual(expect.any(Array));
    });

    it('[ERREUR] devrait retourner 400 Bad Request si email est malformé', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...nouveauCompte, email: 'pas-une-adresse-email' })
        .expect(400);
    });
  });

  // ==========================================================================
  // POST /api/auth/login
  // ==========================================================================
  describe('POST /api/auth/login', () => {
    const compte = {
      email: 'bob@dpscheck.local',
      username: 'bob_top',
      password: 'SecurePwd789!',
      role: UserRole.PLAYER,
    };

    beforeEach(async () => {
      // Pré-condition : un compte existe déjà pour les tests de login
      await registerUser(app, compte);
    });

    it("[NOMINAL] devrait authentifier avec l'email et retourner un JWT", async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ identifier: compte.email, password: compte.password })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.username).toBe('bob_top');
    });

    it("[NOMINAL] devrait authentifier avec le username (alternative à l'email)", async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ identifier: compte.username, password: compte.password })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe('bob@dpscheck.local');
    });

    it('[ERREUR] devrait retourner 401 Unauthorized si le mot de passe est incorrect', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ identifier: compte.username, password: 'MauvaisMotDePasse!' })
        .expect(401);

      // Message générique — pas d'énumération d'utilisateurs (cf. PRD §6.1)
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it("[ERREUR] devrait retourner 401 Unauthorized si l'utilisateur n'existe pas", async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ identifier: 'inconnu@nowhere.local', password: 'N\'importeQuoi123!' })
        .expect(401);
    });
  });

  // ==========================================================================
  // POST /api/auth/forgot-password (stub V2)
  // ==========================================================================
  describe('POST /api/auth/forgot-password (stub V2)', () => {
    it('[NOMINAL] devrait retourner 501 Not Implemented avec un message explicite', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'alice@dpscheck.local' })
        .expect(501);

      // Le message doit mentionner explicitement que la fonctionnalité arrive en V2
      expect(res.body.message).toMatch(/v2|future|planned/i);
    });
  });
});
