import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    findAll(): Promise<import("../../entities/team.entity").Team[]>;
    findOne(id: string): Promise<import("../../entities/team.entity").Team>;
    create(user: AuthenticatedUser, dto: CreateTeamDto): Promise<import("../../entities/team.entity").Team>;
    update(id: string, user: AuthenticatedUser, dto: UpdateTeamDto): Promise<import("../../entities/team.entity").Team>;
    remove(id: string, user: AuthenticatedUser): Promise<void>;
}
