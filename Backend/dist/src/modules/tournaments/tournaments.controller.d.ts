import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentsService } from './tournaments.service';
export declare class TournamentsController {
    private readonly tournamentsService;
    constructor(tournamentsService: TournamentsService);
    findAll(): Promise<import("../../entities/tournament.entity").Tournament[]>;
    findOne(id: string): Promise<import("../../entities/tournament.entity").Tournament>;
    create(user: AuthenticatedUser, dto: CreateTournamentDto): Promise<import("../../entities/tournament.entity").Tournament>;
    update(id: string, user: AuthenticatedUser, dto: UpdateTournamentDto): Promise<import("../../entities/tournament.entity").Tournament>;
    changeStatus(id: string, user: AuthenticatedUser, dto: ChangeStatusDto): Promise<import("../../entities/tournament.entity").Tournament>;
    remove(id: string, user: AuthenticatedUser): Promise<void>;
}
