import { User } from './user.entity';
import { TeamMember } from './team-member.entity';
import { TournamentRegistration } from './tournament-registration.entity';
export declare class Team {
    id: string;
    name: string;
    tag: string;
    captainUserId: string;
    captain: User;
    createdAt: Date;
    updatedAt: Date;
    members?: TeamMember[];
    registrations?: TournamentRegistration[];
}
