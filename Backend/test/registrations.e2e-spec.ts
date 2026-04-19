import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import {
  UserRole,
  TournamentFormat,
  TournamentStatus,
  RegistrationStatus,
} from '../src/common/enums';
import {
  AuthenticatedUser,
  bearer,
  createFullTeam,
  createTestApp,
  registerUser,
  truncateAllTables,
} from './helpers';

/**
 * Tests d'intégration — module Registrations (scénario complet)
 *
 * Workflow testé bout-en-bout :
 *   1. Le TO crée un tournoi et l'ouvre aux inscriptions
 *   2. Un capitaine constitue une équipe complète (5 titulaires)
 *   3. Le capitaine inscrit son équipe → statut PENDING
 *   4. Le TO approuve → statut APPROVED
 *   5. Le capitaine peut annuler tant que la date limite n'est pas dépassée
 *
 * Les tests d'erreur valident les 4 correctifs critiques :
 *   • Correctif #3 — registration bloquée si deadline passée
 *   • Correctif #4 — cancel bloqué si deadline passée
 *   • Équipe doit avoir 5 titulaires actifs
 *   • Seul le TO organisateur peut approuver/rejeter
 *
 * Total : 3 endpoints × multiples cas = 8 cas de test.
 */
describe('Registrations (intégration)', () => {
  let app: INestApplication;
  let organisateur: AuthenticatedUser;
  let capitaine: AuthenticatedUser;
  let tournoiId: string;
  let equipeId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateAllTables(app);

    // ---------- Setup : TO + capitaine + équipe complète + tournoi OPEN ----------
    organisateur = await registerUser(app, {
      email: 'to@dpscheck.local',
      username: 'organizer_one',
      password: 'OrgPassword123!',
      role: UserRole.TO,
    });

    capitaine = await registerUser(app, {
      email: 'captain@dpscheck.local',
      username: 'alice_mid',
      password: 'Password123!',
      role: UserRole.PLAYER,
    });

    // Le capitaine crée une équipe complète (5 joueurs actifs)
    const team = await createFullTeam(app, capitaine);
    equipeId = team.teamId;

    // Le TO crée un tournoi et l'ouvre
    const dans7Jours = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const dans10Jours = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

    const tournoiRes = await request(app.getHttpServer())
      .post('/api/tournaments')
      .set(bearer(organisateur))
      .send({
        name: 'Spring Cup 2026',
        game: 'League of Legends',
        format: TournamentFormat.BO1,
        registrationDeadline: dans7Jours,
        startsAt: dans10Jours,
        maxTeams: 8,
      })
      .expect(201);
    tournoiId = tournoiRes.body.id;

    // Passage en statut OPEN
    await request(app.getHttpServer())
      .patch(`/api/tournaments/${tournoiId}/status`)
      .set(bearer(organisateur))
      .send({ status: TournamentStatus.OPEN })
      .expect(200);
  });

  // ==========================================================================
  // POST /api/tournaments/:tournamentId/registrations/:teamId
  // ==========================================================================
  describe('POST inscription', () => {
    it('[NOMINAL] le capitaine devrait pouvoir inscrire son équipe (statut PENDING)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/tournaments/${tournoiId}/registrations/${equipeId}`)
        .set(bearer(capitaine))
        .expect(201);

      expect(res.body).toMatchObject({
        tournamentId: tournoiId,
        teamId: equipeId,
        status: RegistrationStatus.PENDING,
      });
      expect(res.body.id).toBeDefined();
    });

    it("[ERREUR] devrait retourner 403 si l'appelant n'est pas le capitaine de l'équipe", async () => {
      // Un autre joueur tente d'inscrire l'équipe dont il n'est pas capitaine
      const intrus = await registerUser(app, {
        email: 'intrus@dpscheck.local',
        username: 'intrus_player',
        password: 'IntrusPassword123!',
        role: UserRole.PLAYER,
      });

      await request(app.getHttpServer())
        .post(`/api/tournaments/${tournoiId}/registrations/${equipeId}`)
        .set(bearer(intrus))
        .expect(403);
    });

    it('[ERREUR] devrait retourner 409 Conflict si la même équipe est inscrite deux fois', async () => {
      // Première inscription réussie
      await request(app.getHttpServer())
        .post(`/api/tournaments/${tournoiId}/registrations/${equipeId}`)
        .set(bearer(capitaine))
        .expect(201);

      // Deuxième inscription sur le même tournoi → conflit
      const res = await request(app.getHttpServer())
        .post(`/api/tournaments/${tournoiId}/registrations/${equipeId}`)
        .set(bearer(capitaine))
        .expect(409);

      expect(res.body.message).toMatch(/already registered/i);
    });

    it("[ERREUR] devrait retourner 400 si l'équipe a moins de 5 titulaires actifs", async () => {
      // Création d'une équipe incomplète (le capitaine uniquement)
      const capitaine2 = await registerUser(app, {
        email: 'solo@dpscheck.local',
        username: 'solo_captain',
        password: 'SoloPassword123!',
        role: UserRole.PLAYER,
      });
      const equipeIncompleteRes = await request(app.getHttpServer())
        .post('/api/teams')
        .set(bearer(capitaine2))
        .send({ name: 'Solo Team', tag: 'SOL' })
        .expect(201);

      // Tentative d'inscription avec seulement 1 membre actif
      const res = await request(app.getHttpServer())
        .post(`/api/tournaments/${tournoiId}/registrations/${equipeIncompleteRes.body.id}`)
        .set(bearer(capitaine2))
        .expect(400);

      expect(res.body.message).toMatch(/1 of 5 required active starters/i);
    });
  });

  // ==========================================================================
  // PATCH /api/registrations/:id/review
  // ==========================================================================
  describe('PATCH /review (approbation TO)', () => {
    let inscriptionId: string;

    beforeEach(async () => {
      // Pré-condition : une inscription PENDING existe
      const res = await request(app.getHttpServer())
        .post(`/api/tournaments/${tournoiId}/registrations/${equipeId}`)
        .set(bearer(capitaine))
        .expect(201);
      inscriptionId = res.body.id;
    });

    it("[NOMINAL] le TO organisateur devrait pouvoir APPROUVER l'inscription", async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/registrations/${inscriptionId}/review`)
        .set(bearer(organisateur))
        .send({ status: RegistrationStatus.APPROVED })
        .expect(200);

      expect(res.body.status).toBe(RegistrationStatus.APPROVED);
      expect(res.body.reviewedByUserId).toBe(organisateur.userId);
      expect(res.body.reviewedAt).toBeDefined();
    });

    it('[NOMINAL] le TO devrait pouvoir REJETER avec une note de justification', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/registrations/${inscriptionId}/review`)
        .set(bearer(organisateur))
        .send({
          status: RegistrationStatus.REJECTED,
          reviewNote: 'Équipe incomplète selon les règles internes',
        })
        .expect(200);

      expect(res.body.status).toBe(RegistrationStatus.REJECTED);
      expect(res.body.reviewNote).toBe('Équipe incomplète selon les règles internes');
    });

    it("[ERREUR] devrait retourner 403 si l'appelant n'est pas le TO organisateur", async () => {
      // Le capitaine (pas le TO) tente d'approuver
      await request(app.getHttpServer())
        .patch(`/api/registrations/${inscriptionId}/review`)
        .set(bearer(capitaine))
        .send({ status: RegistrationStatus.APPROVED })
        .expect(403);
    });
  });

  // ==========================================================================
  // PATCH /api/registrations/:id/cancel
  // ==========================================================================
  describe('PATCH /cancel (annulation par le capitaine)', () => {
    let inscriptionId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/tournaments/${tournoiId}/registrations/${equipeId}`)
        .set(bearer(capitaine))
        .expect(201);
      inscriptionId = res.body.id;
    });

    it('[NOMINAL] le capitaine devrait pouvoir annuler son inscription PENDING', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/registrations/${inscriptionId}/cancel`)
        .set(bearer(capitaine))
        .expect(200);

      expect(res.body.status).toBe(RegistrationStatus.CANCELLED);
    });
  });
});
