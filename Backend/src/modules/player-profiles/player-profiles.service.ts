import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerProfile } from '../../entities/player-profile.entity';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums';
import { CreatePlayerProfileDto } from './dto/create-player-profile.dto';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';

@Injectable()
export class PlayerProfilesService {
  constructor(
    @InjectRepository(PlayerProfile) private readonly profiles: Repository<PlayerProfile>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async findMine(userId: number | string): Promise<PlayerProfile> {
    const id = String(userId);
    const profile = await this.profiles.findOne({ where: { userId: id } });
    if (!profile) throw new NotFoundException('Player profile not found');
    return profile;
  }

  async findByUserId(userId: string): Promise<PlayerProfile> {
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Player profile not found');
    return profile;
  }

  async create(userId: number | string, dto: CreatePlayerProfileDto): Promise<PlayerProfile> {
    const id = String(userId);
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== UserRole.PLAYER) {
      throw new BadRequestException('Only PLAYER accounts can have a player profile');
    }

    const existing = await this.profiles.findOne({ where: { userId: id } });
    if (existing) throw new ConflictException('This user already has a player profile');

    const profile = this.profiles.create({
      userId: id,
      summonerName: dto.summonerName,
      tagLine: dto.tagLine,
      region: dto.region,
      mainRole: dto.mainRole ?? null,
      rank: dto.rank ?? null,
      bio: dto.bio ?? null,
    });
    return this.profiles.save(profile);
  }

  async update(userId: number | string, dto: UpdatePlayerProfileDto): Promise<PlayerProfile> {
    const id = String(userId);
    const profile = await this.findMine(id);
    if (dto.summonerName !== undefined) profile.summonerName = dto.summonerName;
    if (dto.tagLine !== undefined) profile.tagLine = dto.tagLine;
    if (dto.region !== undefined) profile.region = dto.region;
    if (dto.mainRole !== undefined) profile.mainRole = dto.mainRole;
    if (dto.rank !== undefined) profile.rank = dto.rank;
    if (dto.bio !== undefined) profile.bio = dto.bio;
    return this.profiles.save(profile);
  }

  async remove(userId: number | string): Promise<void> {
    const id = String(userId);
    const profile = await this.findMine(id);
    await this.profiles.remove(profile);
  }
}
