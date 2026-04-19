/**
 * Variables d'environnement pour les tests d'intégration.
 *
 * Ce fichier est chargé par Jest via `setupFiles` AVANT l'import d'AppModule.
 * Cela garantit que ConfigModule lit les bonnes valeurs pour pointer vers la
 * base de données de tests (port 5433) plutôt que celle de développement.
 */
process.env.NODE_ENV = 'test';

// Base de données de test
process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.DB_PORT ?? '5433';
process.env.DB_USER = process.env.DB_USER ?? 'dpscheck_test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'test_pwd';
process.env.DB_NAME = process.env.DB_NAME ?? 'dpscheck_test';
process.env.DB_SYNCHRONIZE = 'false';
process.env.DB_LOGGING = 'false';

// JWT test
process.env.JWT_SECRET = 'integration_test_secret_do_not_use_in_production';
process.env.JWT_EXPIRES_IN = '1h';

// API
process.env.PORT = '3001';
process.env.API_PREFIX = 'api';
process.env.CORS_ORIGIN = 'http://localhost:4200';
