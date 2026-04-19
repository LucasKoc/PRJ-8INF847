import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Mock du module bcrypt — doit être déclaré AVANT les imports qui en dépendent.
 * Permet de contrôler la valeur de retour de bcrypt.compare() dans chaque test
 * sans modifier le comportement du module en production.
 */
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashedpwd'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums';

/**
 * Tests unitaires — AuthService
 *
 * Stratégie de test :
 *   - Le repository User et le JwtService sont simulés (mocks) afin d'isoler
 *     le service de la base de données et de la signature JWT.
 *   - Les deux méthodes exposées aux utilisateurs sont testées : register() et login().
 *   - Chaque méthode comporte :
 *     • 1 cas nominal  (entrée valide → résultat attendu)
 *     • 1 cas d'erreur (entrée invalide → exception attendue)
 *
 * Total : 2 méthodes × 2 cas = 4 cas de test.
 */
describe('AuthService (unitaire)', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  // Fabrique d'utilisateur simulé réutilisable dans tous les tests
  const mockUtilisateur = (surcharges: Partial<User> = {}): User =>
      ({
        id: '1',
        email: 'alice@dpscheck.local',
        username: 'alice_mid',
        passwordHash: '$2b$10$hashedpwd',
        role: UserRole.PLAYER,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...surcharges,
      }) as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          // Repository User simulé — aucune connexion à la base de données
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          // JwtService simulé — retourne toujours un jeton fixe
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed.jwt.token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  // ==========================================================================
  // register() — création d'un nouveau compte utilisateur
  // ==========================================================================
  describe('register()', () => {
    const dtoValide = {
      email: 'alice@dpscheck.local',
      username: 'alice_mid',
      password: 'Password123!',
      role: UserRole.PLAYER,
    };

    it('[NOMINAL] devrait créer un nouvel utilisateur et retourner un JWT signé', async () => {
      // Arrange — aucun doublon en base
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockImplementation((dto) => dto as User);
      userRepository.save.mockResolvedValue(mockUtilisateur());

      // Act
      const resultat = await service.register(dtoValide);

      // Assert
      expect(resultat).toBeDefined();
      expect(resultat.accessToken).toBe('signed.jwt.token');
      expect(resultat.user).toEqual({
        id: '1',
        email: 'alice@dpscheck.local',
        username: 'alice_mid',
        role: UserRole.PLAYER,
      });
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(
          expect.objectContaining({ username: 'alice_mid', role: UserRole.PLAYER }),
      );
    });

    it("[ERREUR] devrait lever ConflictException si l'adresse email est déjà utilisée", async () => {
      // Arrange — le repository retourne un utilisateur existant avec le même email
      userRepository.findOne.mockResolvedValue(
          mockUtilisateur({ email: dtoValide.email } as Partial<User>),
      );

      // Act & Assert
      await expect(service.register(dtoValide)).rejects.toThrow(ConflictException);
      await expect(service.register(dtoValide)).rejects.toThrow(
          /account with this email already exists/i,
      );
      // Le save ne doit jamais être appelé si un doublon est détecté
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // login() — authentification par identifiant (email ou nom d'utilisateur)
  // ==========================================================================
  describe('login()', () => {
    const identifiants = { identifier: 'alice_mid', password: 'Password123!' };

    it('[NOMINAL] devrait retourner un JWT si les identifiants sont valides', async () => {
      // Arrange — utilisateur trouvé en base, mot de passe correct
      const utilisateur = mockUtilisateur();
      userRepository.findOne.mockResolvedValue(utilisateur);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const resultat = await service.login(identifiants);

      // Assert
      expect(resultat.accessToken).toBe('signed.jwt.token');
      expect(resultat.user.username).toBe('alice_mid');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', utilisateur.passwordHash);
    });

    it('[ERREUR] devrait lever UnauthorizedException si le mot de passe est incorrect', async () => {
      // Arrange — utilisateur trouvé, mais bcrypt retourne false (mauvais mot de passe)
      // Note : le message d'erreur est volontairement générique (pas d'énumération
      // pour éviter les attaques de type user-enumeration — cf. PRD §6.1)
      const utilisateur = mockUtilisateur();
      userRepository.findOne.mockResolvedValue(utilisateur);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(identifiants)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(identifiants)).rejects.toThrow(/invalid credentials/i);
    });
  });
});
