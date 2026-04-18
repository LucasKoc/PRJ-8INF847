import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { RegisterTeamDto } from './dto/register-team.dto';
import { ReviewRegistrationDto } from './dto/review-registration.dto';
import { RegistrationsService } from './registrations.service';
export declare class RegistrationsController {
    private readonly registrationsService;
    constructor(registrationsService: RegistrationsService);
    list(tournamentId: string): Promise<import("../../entities/tournament-registration.entity").TournamentRegistration[]>;
    register(tournamentId: string, user: AuthenticatedUser, dto: RegisterTeamDto): Promise<import("../../entities/tournament-registration.entity").TournamentRegistration>;
    findOne(id: string): Promise<import("../../entities/tournament-registration.entity").TournamentRegistration>;
    review(id: string, user: AuthenticatedUser, dto: ReviewRegistrationDto): Promise<import("../../entities/tournament-registration.entity").TournamentRegistration>;
    cancel(id: string, user: AuthenticatedUser): Promise<import("../../entities/tournament-registration.entity").TournamentRegistration>;
}
