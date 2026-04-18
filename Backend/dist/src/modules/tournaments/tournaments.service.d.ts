import { Repository } from 'typeorm';
import { Tournament } from '../../entities/tournament.entity';
import { TournamentStatus } from '../../common/enums';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
export declare class TournamentsService {
    private readonly tournamentRepo;
    constructor(tournamentRepo: Repository<Tournament>);
    findAll(): Promise<Tournament[]>;
    findById(id: string): Promise<Tournament>;
    create(organizerUserId: string, dto: CreateTournamentDto): Promise<Tournament>;
    update(id: string, requesterUserId: string, dto: UpdateTournamentDto): Promise<Tournament>;
    changeStatus(id: string, requesterUserId: string, next: TournamentStatus): Promise<Tournament>;
    remove(id: string, requesterUserId: string): Promise<void>;
    assertIsOrganizer(tournament: Tournament, requesterUserId: string): void;
    private validateDates;
}
