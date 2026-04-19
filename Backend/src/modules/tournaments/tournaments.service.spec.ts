import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { TournamentsService } from './tournaments.service';
import { Tournament } from '../../entities/tournament.entity';
import { TournamentFormat, TournamentStatus } from '../../common/enums';

/**
 * Tests unitaires — TournamentsService
 *
 * Couvre trois comportements critiques issus du PRD et de l'analyse des écarts :
 *   • findAll()      — les tournois en BROUILLON sont exclus
 *                      de la liste publique, mais visibles par leur TO organisateur.
 *   • create()       — la date limite d'inscription doit précéder la date de début.
 *   • changeStatus() — machine à états du cycle de vie + contrôle de propriété TO.
 *
 * Total : 3 méthodes × 2 cas minimum = 7 cas de test.
 */
describe('TournamentsService (unitaire)', () => {
  let service: TournamentsService;
  let repository: jest.Mocked<Repository<Tournament>>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<Tournament>>;

  // ---------- Données de test ----------
  const mockTournoi = (surcharges: Partial<Tournament> = {}): Tournament =>
    ({
      id: '1',
      organizerUserId: '10',
      name: 'Spring Cup 2026',
      game: 'League of Legends',
      format: TournamentFormat.BO1,
      registrationDeadline: new Date('2026-05-15'),
      startsAt: new Date('2026-05-20'),
      endsAt: null,
      maxTeams: 8,
      status: TournamentStatus.DRAFT,
      ...surcharges,
    }) as Tournament;

  beforeEach(async () => {
    // Faux QueryBuilder chainable — simule le comportement de createQueryBuilder()
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<Tournament>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentsService,
        {
          provide: getRepositoryToken(Tournament),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<TournamentsService>(TournamentsService);
    repository = module.get(getRepositoryToken(Tournament));
  });

  // ==========================================================================
  // findAll() : filtrage des BROUILLONS selon l'identité du demandeur
  // ==========================================================================
  describe('findAll()', () => {
    it('[NOMINAL] devrait exclure les tournois BROUILLON pour un visiteur non authentifié', async () => {
      // Arrange — le QueryBuilder renvoie un seul tournoi OUVERT
      queryBuilder.getMany.mockResolvedValue([mockTournoi({ status: TournamentStatus.OPEN })]);

      // Act — appelant anonyme (undefined)
      const resultat = await service.findAll(undefined);

      // Assert
      expect(resultat).toHaveLength(1);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        't.status != :draft',
        expect.objectContaining({ draft: TournamentStatus.DRAFT }),
      );
    });

    it('[NOMINAL] devrait inclure les BROUILLONS du TO connecté dans ses propres tournois', async () => {
      // Arrange — le QueryBuilder renvoie 1 tournoi OUVERT + 1 BROUILLON appartenant au TO 10
      queryBuilder.getMany.mockResolvedValue([
        mockTournoi({ status: TournamentStatus.OPEN }),
        mockTournoi({ id: '2', status: TournamentStatus.DRAFT, organizerUserId: '10' }),
      ]);

      // Act — TO authentifié avec l'id 10
      const resultat = await service.findAll('10');

      // Assert
      expect(resultat).toHaveLength(2);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        '(t.status != :draft OR t.organizerUserId = :me)',
        expect.objectContaining({ draft: TournamentStatus.DRAFT, me: '10' }),
      );
    });
  });

  // ==========================================================================
  // create() — la date limite doit précéder la date de début
  // ==========================================================================
  describe('create()', () => {
    const dtoValide = {
      name: 'Spring Cup 2026',
      format: TournamentFormat.BO1,
      registrationDeadline: '2026-05-15T23:59:00.000Z', // avant la date de début
      startsAt: '2026-05-20T19:00:00.000Z',
      maxTeams: 8,
    };

    it('[NOMINAL] devrait créer un tournoi en statut BROUILLON si les dates sont valides', async () => {
      // Arrange
      repository.create.mockImplementation(dto => ({ ...dto, id: '1' }) as Tournament);
      repository.save.mockImplementation(t => Promise.resolve(t as Tournament));

      // Act
      const resultat = await service.create('10', dtoValide);

      // Assert — nouveau tournoi en DRAFT, appartenant au TO 10
      expect(resultat.status).toBe(TournamentStatus.DRAFT);
      expect(resultat.organizerUserId).toBe('10');
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('[ERREUR] devrait lever BadRequestException si la date limite est postérieure à la date de début', async () => {
      // Arrange — la date limite (25 mai) est APRÈS le début du tournoi (20 mai)
      const dtoInvalide = {
        ...dtoValide,
        registrationDeadline: '2026-05-25T00:00:00.000Z',
        startsAt: '2026-05-20T19:00:00.000Z',
      };

      // Act & Assert
      await expect(service.create('10', dtoInvalide)).rejects.toThrow(BadRequestException);
      await expect(service.create('10', dtoInvalide)).rejects.toThrow(
        /deadline must precede the start date/i,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // changeStatus() — machine à états + contrôle de propriété
  // ==========================================================================
  describe('changeStatus()', () => {
    it("[NOMINAL] devrait autoriser la transition BROUILLON → OUVERT par l'organisateur TO", async () => {
      // Arrange
      const tournoi = mockTournoi({ status: TournamentStatus.DRAFT });
      repository.findOne.mockResolvedValue(tournoi);
      repository.save.mockImplementation(x => Promise.resolve(x as Tournament));

      // Act
      const resultat = await service.changeStatus('1', '10', TournamentStatus.OPEN);

      // Assert
      expect(resultat.status).toBe(TournamentStatus.OPEN);
    });

    it('[ERREUR] devrait lever BadRequestException pour une transition invalide (OUVERT → BROUILLON)', async () => {
      // Arrange — un tournoi OUVERT ne peut pas revenir en BROUILLON (pas de retour arrière)
      const tournoi = mockTournoi({ status: TournamentStatus.OPEN });
      repository.findOne.mockResolvedValue(tournoi);

      // Act & Assert
      await expect(service.changeStatus('1', '10', TournamentStatus.DRAFT)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.changeStatus('1', '10', TournamentStatus.DRAFT)).rejects.toThrow(
        /cannot transition from OPEN to DRAFT/i,
      );
    });

    it("[ERREUR] devrait lever ForbiddenException si l'appelant n'est pas l'organisateur du tournoi", async () => {
      // Arrange — organisateur est 10, l'appelant est 99
      const tournoi = mockTournoi({ status: TournamentStatus.DRAFT, organizerUserId: '10' });
      repository.findOne.mockResolvedValue(tournoi);

      // Act & Assert
      await expect(service.changeStatus('1', '99', TournamentStatus.OPEN)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
