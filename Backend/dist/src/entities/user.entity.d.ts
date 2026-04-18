import { UserRole } from '../common/enums';
import { PlayerProfile } from './player-profile.entity';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { Tournament } from './tournament.entity';
export declare class User {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    playerProfile?: PlayerProfile;
    captainOfTeams?: Team[];
    teamMemberships?: TeamMember[];
    organizedTournaments?: Tournament[];
}
