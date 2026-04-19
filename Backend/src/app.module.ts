import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from './config/database.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PlayerProfilesModule } from './modules/player-profiles/player-profiles.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => databaseConfig(config),
    }),
    AuthModule,
    UsersModule,
    PlayerProfilesModule,
    TeamsModule,
    TournamentsModule,
    RegistrationsModule,
  ],
  providers: [
    // Global JWT guard — routes opt out with @Public or @OptionalAuth
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global roles guard — only triggers when @Roles() metadata is present
    { provide: APP_GUARD, useClass: RolesGuard },
    // Global error filter — maps PG errors and HttpExceptions to a clean JSON shape
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
