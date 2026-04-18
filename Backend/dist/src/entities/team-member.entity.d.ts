import { LolRole, MemberStatus } from '../common/enums';
import { Team } from './team.entity';
import { User } from './user.entity';
export declare class TeamMember {
    id: string;
    teamId: string;
    team: Team;
    userId: string;
    user: User;
    role: LolRole;
    isSubstitute: boolean;
    status: MemberStatus;
    joinedAt: Date;
    leftAt?: Date | null;
}
