import axios, { AxiosInstance } from 'axios';
import { API_URL } from './driver';

/**
 * Client API HTTP — utilisé pour préparer les données de test sans passer par l'UI.
 *
 * Pourquoi ? Certains tests fonctionnels nécessitent un état initial complexe
 * (un tournoi OUVERT, une équipe de 5 joueurs, etc.). Construire ces données
 * à chaque fois via l'interface graphique serait lent et rendrait les tests
 * fragiles. On utilise donc l'API directement pour la préparation ; Selenium
 * se concentre sur le scénario utilisateur clé à valider.
 */
export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      validateStatus: () => true, // Ne jamais lever d'exception sur statut HTTP
    });
  }

  /**
   * Authentifie via /auth/login et retourne le token JWT.
   */
  async login(identifier: string, password: string): Promise<string> {
    const res = await this.client.post('/auth/login', { identifier, password });
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(
        `Login failed (${res.status}) for ${identifier}: ${JSON.stringify(res.data)}`,
      );
    }
    return res.data.accessToken;
  }

  /**
   * Crée un tournoi via l'API (appelle en tant que TO) et retourne son ID.
   */
  async createTournament(
    token: string,
    params: {
      name: string;
      registrationDeadline: string;
      startsAt: string;
      format?: 'BO1' | 'BO3';
      maxTeams?: number;
    },
  ): Promise<string> {
    const res = await this.client.post(
      '/tournaments',
      {
        name: params.name,
        game: 'League of Legends',
        format: params.format ?? 'BO1',
        registrationDeadline: params.registrationDeadline,
        startsAt: params.startsAt,
        maxTeams: params.maxTeams ?? 8,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (res.status !== 201) {
      throw new Error(`Create tournament failed (${res.status}): ${JSON.stringify(res.data)}`);
    }
    return res.data.id;
  }

  /**
   * Passe un tournoi au statut OPEN (nécessaire pour que les inscriptions soient possibles).
   */
  async openTournament(token: string, tournamentId: string): Promise<void> {
    const res = await this.client.patch(
      `/tournaments/${tournamentId}/status`,
      { status: 'OPEN' },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (res.status !== 200) {
      throw new Error(`Open tournament failed (${res.status}): ${JSON.stringify(res.data)}`);
    }
  }
}

/**
 * Génère un identifiant unique pour éviter les collisions entre exécutions.
 * Basé sur le timestamp actuel — chaque run a des emails/usernames uniques.
 */
export function uniqueId(prefix = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}
