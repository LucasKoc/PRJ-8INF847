import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentRegistration } from '../../entities/tournament-registration.entity';
import { Tournament } from '../../entities/tournament.entity';
import { Team } from '../../entities/team.entity';
import { TeamsModule } from '../teams/teams.module';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TournamentRegistration, Tournament, Team]),
    TeamsModule,
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
