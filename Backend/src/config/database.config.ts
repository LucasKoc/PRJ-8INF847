import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('DB_HOST', 'localhost'),
  port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
  username: config.get<string>('DB_USER', 'dpscheck'),
  password: config.get<string>('DB_PASSWORD', 'dpscheck_dev_pwd'),
  database: config.get<string>('DB_NAME', 'dpscheck'),
  entities: [join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
  synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
  logging: config.get<string>('DB_LOGGING', 'false') === 'true',
  autoLoadEntities: true,
});
