import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMembersService } from './team-members.service';
export declare class TeamMembersController {
    private readonly membersService;
    constructor(membersService: TeamMembersService);
    list(teamId: string): Promise<import("../../entities/team-member.entity").TeamMember[]>;
    add(teamId: string, user: AuthenticatedUser, dto: AddTeamMemberDto): Promise<import("../../entities/team-member.entity").TeamMember>;
    update(teamId: string, memberId: string, user: AuthenticatedUser, dto: UpdateTeamMemberDto): Promise<import("../../entities/team-member.entity").TeamMember>;
    remove(teamId: string, memberId: string, user: AuthenticatedUser): Promise<import("../../entities/team-member.entity").TeamMember>;
}
