import { Repository } from 'typeorm';
import { PlayerProfile } from '../../entities/player-profile.entity';
import { User } from '../../entities/user.entity';
import { CreatePlayerProfileDto } from './dto/create-player-profile.dto';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';
export declare class PlayerProfilesService {
    private readonly profileRepo;
    private readonly userRepo;
    constructor(profileRepo: Repository<PlayerProfile>, userRepo: Repository<User>);
    findAll(): Promise<PlayerProfile[]>;
    findByUserId(userId: string): Promise<PlayerProfile>;
    create(userId: string, dto: CreatePlayerProfileDto): Promise<PlayerProfile>;
    update(userId: string, dto: UpdatePlayerProfileDto): Promise<PlayerProfile>;
    remove(userId: string): Promise<void>;
}
