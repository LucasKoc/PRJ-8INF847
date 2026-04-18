import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerProfile } from '../../entities/player-profile.entity';
import { User } from '../../entities/user.entity';
import { PlayerProfilesController } from './player-profiles.controller';
import { PlayerProfilesService } from './player-profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerProfile, User])],
  controllers: [PlayerProfilesController],
  providers: [PlayerProfilesService],
  exports: [PlayerProfilesService],
})
export class PlayerProfilesModule {}
