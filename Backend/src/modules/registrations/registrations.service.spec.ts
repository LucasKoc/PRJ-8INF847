import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RegistrationsService } from './registrations.service';
import { TeamsService } from '../teams/teams.service';
import { TournamentRegistration } from '../../entities/tournament-registration.entity';
import { Tournament } from '../../entities/tournament.entity';
import { Team } from '../../entities/team.entity';
import { RegistrationStatus, TournamentFormat, TournamentStatus } from '../../common/enums';

/**
 * Tests unitaires — RegistrationsService
 *
 * Couvre les deux correctifs de délai identifiés lors de l'analyse des écarts :
 *   • register() rejette l'inscription si la date limite est dépassée.
 *   • cancel() rejette l'annulation si la date limite est dépassée.
 * Teste également la vérification d'éligibilité (min. 5 titulaires actifs)
 * et le contrôle de propriété du capitaine.
 *
 * Total : 3 méthodes × 2 cas minimum = 8 cas de test.
 */
describe('RegistrationsService (unitaire)', () => {
  let service: RegistrationsService;
  let regsRepo: jest.Mocked<Repository<TournamentRegistration>>;
  let tournamentsRepo: jest.Mocked<Repository<Tournament>>;
  let teamsRepo: jest.Mocked<Repository<Team>>;
  let teamsService: jest.Mocked<TeamsService>;

  // ---------- Données de test ----------
  const dateFuture = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 jours
  const datePassee = () => new Date(Date.now() - 24 * 60 * 60 * 1000); // -1 jour

  const mockTournoi = (surcharges: Partial<Tournament> = {}): Tournament =>
    ({
      id: '1',
      organizerUserId: '10',
      name: 'Spring Cup 2026',
      game: 'League of Legends',
      format: TournamentFormat.BO1,
      registrationDeadline: dateFuture(),
      startsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      maxTeams: 8,
      status: TournamentStatus.OPEN,
      ...surcharges,
    }) as Tournament;

  const mockEquipe = (surcharges: Partial<Team> = {}): Team =>
    ({ id: '100', name: 'Phoenix', tag: 'PHX', captainUserId: '20', ...surcharges }) as Team;

  const mockInscription = (
    surcharges: Partial<TournamentRegistration> = {},
  ): TournamentRegistration =>
    ({
      id: '500',
      tournamentId: '1',
      teamId: '100',
      status: RegistrationStatus.PENDING,
      ...surcharges,
    }) as TournamentRegistration;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        {
          provide: getRepositoryToken(TournamentRegistration),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tournament),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Team),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: TeamsService,
          useValue: { countActiveStarters: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RegistrationsService>(RegistrationsService);
    regsRepo = module.get(getRepositoryToken(TournamentRegistration));
    tournamentsRepo = module.get(getRepositoryToken(Tournament));
    teamsRepo = module.get(getRepositoryToken(Team));
    teamsService = module.get(TeamsService);
  });

  // ==========================================================================
  // register() : vérification explicite de la date limite
  // ==========================================================================
  describe('register()', () => {
    it('[NOMINAL] devrait créer une inscription EN_ATTENTE quand toutes les vérifications passent', async () => {
      // Arrange
      tournamentsRepo.findOne.mockResolvedValue(mockTournoi());
      teamsRepo.findOne.mockResolvedValue(mockEquipe());
      teamsService.countActiveStarters.mockResolvedValue(5); // exactement le minimum requis
      regsRepo.findOne.mockResolvedValue(null); // pas encore inscrit
      regsRepo.count.mockResolvedValue(2); // 2 équipes sur 8 déjà inscrites
      regsRepo.create.mockImplementation(dto => dto as TournamentRegistration);
      regsRepo.save.mockImplementation(r =>
        Promise.resolve({ ...r, id: '500' } as TournamentRegistration),
      );

      // Act
      const resultat = await service.register('1', '100', '20');

      // Assert
      expect(resultat.status).toBe(RegistrationStatus.PENDING);
      expect(regsRepo.save).toHaveBeenCalled();
    });

    it('[ERREUR] devrait lever BadRequestException si la date limite des inscriptions est dépassée', async () => {
      // Arrange — tournoi avec date limite déjà passée
      const tournoisExpire = mockTournoi({ registrationDeadline: datePassee() });
      tournamentsRepo.findOne.mockResolvedValue(tournoisExpire);

      // Act & Assert
      await expect(service.register('1', '100', '20')).rejects.toThrow(BadRequestException);
      await expect(service.register('1', '100', '20')).rejects.toThrow(
        /registration deadline has passed/i,
      );
      expect(regsRepo.save).not.toHaveBeenCalled();
    });

    it("[ERREUR] devrait lever BadRequestException si l'équipe n'a pas assez de titulaires actifs", async () => {
      // Arrange — seulement 3 titulaires alors que 5 sont requis
      tournamentsRepo.findOne.mockResolvedValue(mockTournoi());
      teamsRepo.findOne.mockResolvedValue(mockEquipe());
      teamsService.countActiveStarters.mockResolvedValue(3);

      // Act & Assert
      await expect(service.register('1', '100', '20')).rejects.toThrow(BadRequestException);
      await expect(service.register('1', '100', '20')).rejects.toThrow(
        /3 of 5 required active starters/i,
      );
    });
  });

  // ==========================================================================
  // cancel() : vérification de la date limite avant annulation
  // ==========================================================================
  describe('cancel()', () => {
    it('[NOMINAL] devrait annuler une inscription EN_ATTENTE si le demandeur est le capitaine', async () => {
      // Arrange
      const inscription = mockInscription({
        team: mockEquipe({ captainUserId: '20' }),
        tournament: mockTournoi(),
      });
      regsRepo.findOne.mockResolvedValue(inscription);
      regsRepo.save.mockImplementation(r => Promise.resolve(r as TournamentRegistration));

      // Act
      const resultat = await service.cancel('500', '20');

      // Assert
      expect(resultat.status).toBe(RegistrationStatus.CANCELLED);
      expect(resultat.reviewedAt).toBeInstanceOf(Date);
    });

    it("[ERREUR] devrait lever BadRequestException lors d'une annulation après la date limite", async () => {
      // Arrange — date limite déjà passée
      const inscription = mockInscription({
        team: mockEquipe({ captainUserId: '20' }),
        tournament: mockTournoi({ registrationDeadline: datePassee() }),
      });
      regsRepo.findOne.mockResolvedValue(inscription);

      // Act & Assert
      await expect(service.cancel('500', '20')).rejects.toThrow(BadRequestException);
      await expect(service.cancel('500', '20')).rejects.toThrow(
        /cannot cancel registration after the registration deadline/i,
      );
    });

    it("[ERREUR] devrait lever ForbiddenException si le demandeur n'est pas le capitaine de l'équipe", async () => {
      // Arrange — l'appelant (id 99) n'est pas le capitaine (id 20)
      const inscription = mockInscription({
        team: mockEquipe({ captainUserId: '20' }),
        tournament: mockTournoi(),
      });
      regsRepo.findOne.mockResolvedValue(inscription);

      // Act & Assert
      await expect(service.cancel('500', '99')).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================================================
  // review() — validation TO : approbation / rejet d'une inscription
  // ==========================================================================
  describe('review()', () => {
    it("[NOMINAL] devrait permettre à l'organisateur TO d'APPROUVER une inscription EN_ATTENTE", async () => {
      // Arrange
      const inscription = mockInscription({
        tournament: mockTournoi({ organizerUserId: '10' }),
      });
      regsRepo.findOne.mockResolvedValue(inscription);
      regsRepo.save.mockImplementation(r => Promise.resolve(r as TournamentRegistration));

      // Act
      const resultat = await service.review('500', '10', {
        status: RegistrationStatus.APPROVED,
      });

      // Assert
      expect(resultat.status).toBe(RegistrationStatus.APPROVED);
      expect(resultat.reviewedByUserId).toBe('10');
    });

    it('[ERREUR] devrait lever BadRequestException si on tente de réviser une inscription déjà traitée', async () => {
      // Arrange — inscription déjà approuvée
      const inscription = mockInscription({
        status: RegistrationStatus.APPROVED,
        tournament: mockTournoi({ organizerUserId: '10' }),
      });
      regsRepo.findOne.mockResolvedValue(inscription);

      // Act & Assert
      await expect(
        service.review('500', '10', { status: RegistrationStatus.REJECTED }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.review('500', '10', { status: RegistrationStatus.REJECTED }),
      ).rejects.toThrow(/already been reviewed/i);
    });
  });
});
