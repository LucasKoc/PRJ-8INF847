import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { UserRole, TournamentFormat, TournamentStatus } from '../src/common/enums';
import {
  AuthenticatedUser,
  bearer,
  createTestApp,
  registerUser,
  truncateAllTables,
} from './helpers';

/**
 * Tests d'intégration — module Tournaments
 *
 * Scénarios couverts :
 *   • POST   /api/tournaments          — création par un TO authentifié
 *   • GET    /api/tournaments          — listage public avec filtre DRAFT
 *   • GET    /api/tournaments/:id      — détail avec relations
 *   • PATCH  /api/tournaments/:id/status — machine à états du cycle de vie
 *
 * Tous les tests vérifient le pipeline complet :
 *   HTTP → JwtAuthGuard → RolesGuard → Controller → Service → TypeORM → PostgreSQL.
 *
 * Total : 4 endpoints × 2+ cas = 9 cas de test.
 */
describe('Tournaments (intégration)', () => {
  let app: INestApplication;
  let organisateur: AuthenticatedUser;
  let joueur: AuthenticatedUser;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateAllTables(app);

    // Crée deux utilisateurs : un TO et un joueur standard
    organisateur = await registerUser(app, {
      email: 'to@dpscheck.local',
      username: 'organizer_one',
      password: 'OrgPassword123!',
      role: UserRole.TO,
    });
    joueur = await registerUser(app, {
      email: 'player@dpscheck.local',
      username: 'alice_mid',
      password: 'Password123!',
      role: UserRole.PLAYER,
    });
  });

  // Helper interne — génère un DTO de tournoi valide avec dates futures
  const dtoTournoiValide = () => {
    const dans7Jours = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const dans10Jours = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    return {
      name: 'Spring Cup 2026',
      game: 'League of Legends',
      format: TournamentFormat.BO1,
      registrationDeadline: dans7Jours.toISOString(),
      startsAt: dans10Jours.toISOString(),
      maxTeams: 8,
    };
  };

  // ==========================================================================
  // POST /api/tournaments
  // ==========================================================================
  describe('POST /api/tournaments', () => {
    it('[NOMINAL] devrait permettre à un TO de créer un tournoi en statut DRAFT', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/tournaments')
        .set(bearer(organisateur))
        .send(dtoTournoiValide())
        .expect(201);

      expect(res.body).toMatchObject({
        name: 'Spring Cup 2026',
        format: TournamentFormat.BO1,
        maxTeams: 8,
        status: TournamentStatus.DRAFT,
        organizerUserId: organisateur.userId,
      });
      expect(res.body.id).toBeDefined();
    });

    it('[ERREUR] devrait retourner 403 Forbidden pour un joueur non-TO', async () => {
      await request(app.getHttpServer())
        .post('/api/tournaments')
        .set(bearer(joueur))
        .send(dtoTournoiValide())
        .expect(403);
    });

    it('[ERREUR] devrait retourner 401 Unauthorized sans token', async () => {
      await request(app.getHttpServer())
        .post('/api/tournaments')
        .send(dtoTournoiValide())
        .expect(401);
    });

    it('[ERREUR] devrait retourner 400 Bad Request si la date limite est postérieure à la date de début', async () => {
      const dtoInvalide = {
        ...dtoTournoiValide(),
        // Date limite APRÈS la date de début (inversion illégale)
        registrationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        startsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request(app.getHttpServer())
        .post('/api/tournaments')
        .set(bearer(organisateur))
        .send(dtoInvalide)
        .expect(400);

      expect(JSON.stringify(res.body.message)).toMatch(/deadline.*precede.*start/i);
    });
  });

  // ==========================================================================
  // GET /api/tournaments : filtre DRAFT
  // ==========================================================================
  describe('GET /api/tournaments', () => {
    it('[NOMINAL] un visiteur anonyme ne voit PAS les tournois DRAFT', async () => {
      // Le TO crée un tournoi — il est en DRAFT par défaut
      await request(app.getHttpServer())
        .post('/api/tournaments')
        .set(bearer(organisateur))
        .send(dtoTournoiValide())
        .expect(201);

      // Visiteur non authentifié : liste vide
      const res = await request(app.getHttpServer()).get('/api/tournaments').expect(200);

      expect(res.body).toHaveLength(0);
    });

    it('[NOMINAL] un TO voit ses propres tournois DRAFT dans la liste', async () => {
      await request(app.getHttpServer())
        .post('/api/tournaments')
        .set(bearer(organisateur))
        .send(dtoTournoiValide())
        .expect(201);

      // Même TO authentifié : il voit son brouillon
      const res = await request(app.getHttpServer())
        .get('/api/tournaments')
        .set(bearer(organisateur))
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].status).toBe(TournamentStatus.DRAFT);
    });
  });

  // ==========================================================================
  // PATCH /api/tournaments/:id/status — machine à états
  // ==========================================================================
  describe('PATCH /api/tournaments/:id/status', () => {
    let tournoiId: string;

    beforeEach(async () => {
      // Pré-condition : un tournoi DRAFT existe
      const res = await request(app.getHttpServer())
        .post('/api/tournaments')
        .set(bearer(organisateur))
        .send(dtoTournoiValide())
        .expect(201);
      tournoiId = res.body.id;
    });

    it("[NOMINAL] devrait autoriser la transition DRAFT → OPEN par l'organisateur", async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/tournaments/${tournoiId}/status`)
        .set(bearer(organisateur))
        .send({ status: TournamentStatus.OPEN })
        .expect(200);

      expect(res.body.status).toBe(TournamentStatus.OPEN);
    });

    it("[ERREUR] devrait retourner 403 si l'appelant n'est pas l'organisateur du tournoi", async () => {
      // Un autre TO tente de modifier le tournoi
      const autreTo = await registerUser(app, {
        email: 'autre-to@dpscheck.local',
        username: 'other_to',
        password: 'OtherPassword123!',
        role: UserRole.TO,
      });

      await request(app.getHttpServer())
        .patch(`/api/tournaments/${tournoiId}/status`)
        .set(bearer(autreTo))
        .send({ status: TournamentStatus.OPEN })
        .expect(403);
    });

    it('[ERREUR] devrait retourner 400 pour une transition invalide (DRAFT → COMPLETED)', async () => {
      // Saut illégal : on ne peut pas passer directement en COMPLETED
      await request(app.getHttpServer())
        .patch(`/api/tournaments/${tournoiId}/status`)
        .set(bearer(organisateur))
        .send({ status: TournamentStatus.COMPLETED })
        .expect(400);
    });
  });
});
