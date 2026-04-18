import { Repository } from 'typeorm';
import { TournamentRegistration } from '../../entities/tournament-registration.entity';
import { Tournament } from '../../entities/tournament.entity';
import { Team } from '../../entities/team.entity';
import { TeamsService } from '../teams/teams.service';
import { RegisterTeamDto } from './dto/register-team.dto';
import { ReviewRegistrationDto } from './dto/review-registration.dto';
export declare class RegistrationsService {
    private readonly regRepo;
    private readonly tournamentRepo;
    private readonly teamRepo;
    private readonly teamsService;
    constructor(regRepo: Repository<TournamentRegistration>, tournamentRepo: Repository<Tournament>, teamRepo: Repository<Team>, teamsService: TeamsService);
    listByTournament(tournamentId: string): Promise<TournamentRegistration[]>;
    findById(id: string): Promise<TournamentRegistration>;
    register(tournamentId: string, requesterUserId: string, dto: RegisterTeamDto): Promise<TournamentRegistration>;
    review(registrationId: string, reviewerUserId: string, dto: ReviewRegistrationDto): Promise<TournamentRegistration>;
    cancel(registrationId: string, requesterUserId: string): Promise<TournamentRegistration>;
}
