import { DataSource, Repository } from 'typeorm';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { User } from '../../entities/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
export declare class TeamsService {
    private readonly teamRepo;
    private readonly memberRepo;
    private readonly userRepo;
    private readonly dataSource;
    constructor(teamRepo: Repository<Team>, memberRepo: Repository<TeamMember>, userRepo: Repository<User>, dataSource: DataSource);
    findAll(): Promise<Team[]>;
    findById(id: string): Promise<Team>;
    create(captainUserId: string, dto: CreateTeamDto): Promise<Team>;
    update(id: string, requesterUserId: string, dto: UpdateTeamDto): Promise<Team>;
    remove(id: string, requesterUserId: string): Promise<void>;
    countActiveStarters(teamId: string): Promise<number>;
    assertIsCaptain(team: Team, requesterUserId: string): void;
}
