import { TournamentStatus } from '../common/enums';
import { User } from './user.entity';
import { TournamentRegistration } from './tournament-registration.entity';
export declare class Tournament {
    id: string;
    organizerUserId: string;
    organizer: User;
    name: string;
    game: string;
    format: string;
    registrationDeadline: Date;
    startsAt: Date;
    endsAt?: Date | null;
    maxTeams: number;
    status: TournamentStatus;
    createdAt: Date;
    updatedAt: Date;
    registrations?: TournamentRegistration[];
}
