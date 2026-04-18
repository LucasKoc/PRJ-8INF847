import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreatePlayerProfileDto } from './dto/create-player-profile.dto';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';
import { PlayerProfilesService } from './player-profiles.service';
export declare class PlayerProfilesController {
    private readonly profilesService;
    constructor(profilesService: PlayerProfilesService);
    findAll(): Promise<import("../../entities/player-profile.entity").PlayerProfile[]>;
    me(user: AuthenticatedUser): Promise<import("../../entities/player-profile.entity").PlayerProfile>;
    findByUser(userId: string): Promise<import("../../entities/player-profile.entity").PlayerProfile>;
    create(user: AuthenticatedUser, dto: CreatePlayerProfileDto): Promise<import("../../entities/player-profile.entity").PlayerProfile>;
    update(user: AuthenticatedUser, dto: UpdatePlayerProfileDto): Promise<import("../../entities/player-profile.entity").PlayerProfile>;
    remove(user: AuthenticatedUser): Promise<void>;
}
