import { RegistrationStatus } from '../common/enums';
import { Tournament } from './tournament.entity';
import { Team } from './team.entity';
import { User } from './user.entity';
export declare class TournamentRegistration {
    id: string;
    tournamentId: string;
    tournament: Tournament;
    teamId: string;
    team: Team;
    status: RegistrationStatus;
    registeredAt: Date;
    reviewedAt?: Date | null;
    reviewedBy?: string | null;
    reviewer?: User | null;
    reviewNote?: string | null;
}
