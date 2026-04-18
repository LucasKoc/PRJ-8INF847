import { Repository } from 'typeorm';
import { TeamMember } from '../../entities/team-member.entity';
import { Team } from '../../entities/team.entity';
import { User } from '../../entities/user.entity';
import { MemberStatus } from '../../common/enums';
import { TeamsService } from '../teams/teams.service';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
export declare class TeamMembersService {
    private readonly memberRepo;
    private readonly teamRepo;
    private readonly userRepo;
    private readonly teamsService;
    constructor(memberRepo: Repository<TeamMember>, teamRepo: Repository<Team>, userRepo: Repository<User>, teamsService: TeamsService);
    listByTeam(teamId: string): Promise<TeamMember[]>;
    add(teamId: string, requesterUserId: string, dto: AddTeamMemberDto): Promise<TeamMember>;
    update(teamId: string, memberId: string, requesterUserId: string, dto: UpdateTeamMemberDto): Promise<TeamMember>;
    remove(teamId: string, memberId: string, requesterUserId: string, reason?: MemberStatus): Promise<TeamMember>;
}
