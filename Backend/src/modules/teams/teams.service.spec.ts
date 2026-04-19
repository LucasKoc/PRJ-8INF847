import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { TeamsService } from './teams.service';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { User } from '../../entities/user.entity';
import { PlayerProfile } from '../../entities/player-profile.entity';
import { LolRole, MemberStatus, UserRole } from '../../common/enums';

/**
 * Tests unitaires — TeamsService
 *
 * Couvre les règles métier critiques de la gestion des équipes :
 *   • addMember()           — seul un PLAYER peut être ajouté, un joueur ne peut
 *                             appartenir qu'à une seule équipe active, seul le
 *                             capitaine peut ajouter des membres.
 *   • removeMember()        — seul le capitaine peut retirer un membre ; le
 *                             capitaine ne peut pas se retirer lui-même.
 *   • countActiveStarters() — helper d'éligibilité utilisé par RegistrationsService
 *                             pour vérifier le minimum de 5 titulaires.
 *
 * Total : 3 méthodes × 2 cas minimum = 8 cas de test.
 */
describe('TeamsService (unitaire)', () => {
  let service: TeamsService;
  let teamsRepo: jest.Mocked<Repository<Team>>;
  let membersRepo: jest.Mocked<Repository<TeamMember>>;
  let usersRepo: jest.Mocked<Repository<User>>;

  // ---------- Données de test ----------
  const mockEquipe = (surcharges: Partial<Team> = {}): Team =>
    ({ id: '1', name: 'Phoenix', tag: 'PHX', captainUserId: '20', ...surcharges }) as Team;

  const mockUtilisateur = (surcharges: Partial<User> = {}): User =>
    ({
      id: '30',
      email: 'bob@dpscheck.local',
      username: 'bob_top',
      passwordHash: 'hash',
      role: UserRole.PLAYER,
      ...surcharges,
    }) as User;

  const mockMembre = (surcharges: Partial<TeamMember> = {}): TeamMember =>
    ({
      id: '500',
      teamId: '1',
      userId: '30',
      role: LolRole.TOP,
      isSubstitute: false,
      status: MemberStatus.ACTIVE,
      ...surcharges,
    }) as TeamMember;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: getRepositoryToken(Team),
          useValue: { findOne: jest.fn(), find: jest.fn(), save: jest.fn(), remove: jest.fn() },
        },
        {
          provide: getRepositoryToken(TeamMember),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn() },
        },
        {
          // Mock du repository PlayerProfile ajouté lors du correctif de récupération
          // du rôle LoL du capitaine lors de la création d'une équipe
          provide: getRepositoryToken(PlayerProfile),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: { transaction: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    teamsRepo = module.get(getRepositoryToken(Team));
    membersRepo = module.get(getRepositoryToken(TeamMember));
    usersRepo = module.get(getRepositoryToken(User));
  });

  // ==========================================================================
  // addMember() — contrôles capitaine, rôle et unicité d'équipe active
  // ==========================================================================
  describe('addMember()', () => {
    const ajoutDto = { userId: '30', role: LolRole.TOP, isSubstitute: false };

    it("[NOMINAL] devrait ajouter un utilisateur PLAYER à l'équipe en tant que membre ACTIF", async () => {
      // Arrange
      teamsRepo.findOne.mockResolvedValue(mockEquipe());
      usersRepo.findOne.mockResolvedValue(mockUtilisateur());
      // Pas de membership actif existant, ni dans cette équipe ni ailleurs
      membersRepo.findOne.mockResolvedValue(null);
      membersRepo.create.mockImplementation(dto => dto as TeamMember);
      membersRepo.save.mockImplementation(m => Promise.resolve({ ...m, id: '500' } as TeamMember));

      // Act
      const resultat = await service.addMember('1', '20', ajoutDto);

      // Assert
      expect(resultat.status).toBe(MemberStatus.ACTIVE);
      expect(resultat.role).toBe(LolRole.TOP);
    });

    it("[ERREUR] devrait lever ForbiddenException si l'appelant n'est pas le capitaine", async () => {
      // Arrange — capitaine est 20, l'appelant est 99
      teamsRepo.findOne.mockResolvedValue(mockEquipe({ captainUserId: '20' }));

      // Act & Assert
      await expect(service.addMember('1', '99', ajoutDto)).rejects.toThrow(ForbiddenException);
      await expect(service.addMember('1', '99', ajoutDto)).rejects.toThrow(
        /only the team captain/i,
      );
    });

    it("[ERREUR] devrait lever BadRequestException si l'utilisateur cible a le rôle TO", async () => {
      // Arrange — les comptes TO ne peuvent pas rejoindre une équipe
      teamsRepo.findOne.mockResolvedValue(mockEquipe());
      usersRepo.findOne.mockResolvedValue(mockUtilisateur({ role: UserRole.TO }));

      // Act & Assert
      await expect(service.addMember('1', '20', ajoutDto)).rejects.toThrow(BadRequestException);
      await expect(service.addMember('1', '20', ajoutDto)).rejects.toThrow(/only PLAYER accounts/i);
    });

    it('[ERREUR] devrait lever ConflictException si le joueur est déjà actif dans une autre équipe', async () => {
      // Arrange — le joueur appartient déjà à l'équipe 99
      teamsRepo.findOne.mockResolvedValue(mockEquipe());
      usersRepo.findOne.mockResolvedValue(mockUtilisateur());
      membersRepo.findOne.mockResolvedValue(
        mockMembre({ teamId: '99', status: MemberStatus.ACTIVE }),
      );

      // Act & Assert
      await expect(service.addMember('1', '20', ajoutDto)).rejects.toThrow(ConflictException);
      await expect(service.addMember('1', '20', ajoutDto)).rejects.toThrow(
        /already active on another team/i,
      );
    });
  });

  // ==========================================================================
  // removeMember() — seul le capitaine peut retirer un membre (sauf lui-même)
  // ==========================================================================
  describe('removeMember()', () => {
    it('[NOMINAL] devrait marquer le membre comme REMOVED (suppression logique)', async () => {
      // Arrange
      teamsRepo.findOne.mockResolvedValue(mockEquipe({ captainUserId: '20' }));
      membersRepo.findOne.mockResolvedValue(mockMembre({ userId: '30' }));
      membersRepo.save.mockImplementation(m => Promise.resolve(m as TeamMember));

      // Act & Assert — la méthode ne retourne rien (void)
      await expect(service.removeMember('1', '500', '20')).resolves.toBeUndefined();
      expect(membersRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: MemberStatus.REMOVED,
          leftAt: expect.any(Date),
        }),
      );
    });

    it('[ERREUR] devrait lever BadRequestException si le capitaine tente de se retirer lui-même', async () => {
      // Arrange — le membre à retirer est le capitaine lui-même (userId 20 = captainUserId 20)
      teamsRepo.findOne.mockResolvedValue(mockEquipe({ captainUserId: '20' }));
      membersRepo.findOne.mockResolvedValue(mockMembre({ userId: '20' }));

      // Act & Assert
      await expect(service.removeMember('1', '500', '20')).rejects.toThrow(BadRequestException);
      await expect(service.removeMember('1', '500', '20')).rejects.toThrow(
        /captain cannot remove themselves/i,
      );
    });
  });

  // ==========================================================================
  // countActiveStarters() — helper d'éligibilité aux tournois
  // ==========================================================================
  describe('countActiveStarters()', () => {
    it('[NOMINAL] devrait retourner le nombre de titulaires ACTIFS non-remplaçants', async () => {
      // Arrange — 5 titulaires, correspond exactement au minimum requis par le PRD
      membersRepo.count.mockResolvedValue(5);

      // Act
      const resultat = await service.countActiveStarters('1');

      // Assert
      expect(resultat).toBe(5);
      expect(membersRepo.count).toHaveBeenCalledWith({
        where: {
          teamId: '1',
          status: MemberStatus.ACTIVE,
          isSubstitute: false,
        },
      });
    });

    it("[LIMITE] devrait retourner 0 si l'équipe n'a aucun titulaire actif", async () => {
      // Arrange — équipe vide ou sans titulaires (ex : tous sont remplaçants)
      membersRepo.count.mockResolvedValue(0);

      // Act
      const resultat = await service.countActiveStarters('1');

      // Assert
      expect(resultat).toBe(0);
    });
  });
});
