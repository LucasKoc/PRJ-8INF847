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
    @InjectRepository(PlayerProfile)
    private readonly profileRepo: Repository<PlayerProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findAll(): Promise<PlayerProfile[]> {
    return this.profileRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findByUserId(userId: string): Promise<PlayerProfile> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException(`Aucun profil joueur pour l'utilisateur ${userId}`);
    }
    return profile;
  }

  async create(userId: string, dto: CreatePlayerProfileDto): Promise<PlayerProfile> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${userId} introuvable`);
    }
    if (user.role !== UserRole.PLAYER) {
      throw new BadRequestException(
        'Seul un utilisateur de rôle PLAYER peut créer un profil joueur',
      );
    }

    const existing = await this.profileRepo.findOne({ where: { userId } });
    if (existing) {
      throw new ConflictException('Un profil joueur existe déjà');
    }

    const profile = this.profileRepo.create({ ...dto, userId });
    return this.profileRepo.save(profile);
  }

  async update(userId: string, dto: UpdatePlayerProfileDto): Promise<PlayerProfile> {
    const profile = await this.findByUserId(userId);
    Object.assign(profile, dto);
    return this.profileRepo.save(profile);
  }

  async remove(userId: string): Promise<void> {
    const profile = await this.findByUserId(userId);
    await this.profileRepo.remove(profile);
  }
}
