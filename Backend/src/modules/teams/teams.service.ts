import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { User } from '../../entities/user.entity';
import { MemberStatus, UserRole } from '../../common/enums';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private readonly teams: Repository<Team>,
    @InjectRepository(TeamMember) private readonly members: Repository<TeamMember>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  // =========================================================================
  // TEAM CRUD
  // =========================================================================

  async findAll(): Promise<Team[]> {
    return this.teams.find({
      relations: { captain: true, members: { user: true } },
      order: { name: 'ASC' },
    });
  }

  /**
   * Returns the team with its captain and ONLY its ACTIVE members populated.
   * Non-active (REMOVED / LEFT) memberships are excluded at the API level.
   */
  async findOne(id: string): Promise<Team> {
    const team = await this.teams.findOne({
      where: { id },
      relations: { captain: true },
    });
    if (!team) throw new NotFoundException(`Team ${id} not found`);

    team.members = await this.members.find({
      where: { teamId: id, status: MemberStatus.ACTIVE },
      relations: { user: true },
      order: { isSubstitute: 'ASC', joinedAt: 'ASC' },
    });
    return team;
  }

  async create(captainUserId: number | string, dto: CreateTeamDto): Promise<Team> {
    const captainId = String(captainUserId);

    const captain = await this.users.findOne({ where: { id: captainId } });
    if (!captain) throw new NotFoundException('Captain user not found');
    if (captain.role !== UserRole.PLAYER) {
      throw new BadRequestException('Only PLAYER accounts can create a team');
    }

    // Captain cannot already be ACTIVE on another team
    const existingActive = await this.members.findOne({
      where: { userId: captainId, status: MemberStatus.ACTIVE },
    });
    if (existingActive) {
      throw new ConflictException('You are already an active member of another team');
    }

    // Persist team + captain membership in one transaction.
    // Captain's LoL role defaults to FLEX — they can update it via members endpoint.
    return this.dataSource.transaction(async manager => {
      const team = manager.create(Team, {
        name: dto.name.trim(),
        tag: dto.tag.toUpperCase(),
        captainUserId: captainId,
      });
      const saved = await manager.save(team);

      const membership = manager.create(TeamMember, {
        teamId: saved.id,
        userId: captainId,
        role: 'FLEX' as never,
        isSubstitute: false,
        status: MemberStatus.ACTIVE,
      });
      await manager.save(membership);

      return this.findOne(saved.id);
    });
  }

  async update(id: string, userId: number | string, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);
    if (team.captainUserId !== String(userId)) {
      throw new ForbiddenException('Only the team captain can update the team');
    }
    if (dto.name !== undefined) team.name = dto.name.trim();
    if (dto.tag !== undefined) team.tag = dto.tag.toUpperCase();
    await this.teams.save(team);
    return this.findOne(id);
  }

  async remove(id: string, userId: number | string): Promise<void> {
    const team = await this.teams.findOne({ where: { id } });
    if (!team) throw new NotFoundException(`Team ${id} not found`);
    if (team.captainUserId !== String(userId)) {
      throw new ForbiddenException('Only the team captain can delete the team');
    }
    await this.teams.remove(team);
  }

  // =========================================================================
  // MEMBER MANAGEMENT
  // =========================================================================

  async listMembers(teamId: string): Promise<TeamMember[]> {
    await this.assertTeamExists(teamId);
    return this.members.find({
      where: { teamId, status: MemberStatus.ACTIVE },
      relations: { user: true },
      order: { isSubstitute: 'ASC', joinedAt: 'ASC' },
    });
  }

  async addMember(
    teamId: string,
    captainUserId: number | string,
    dto: AddTeamMemberDto,
  ): Promise<TeamMember> {
    const team = await this.assertTeamExists(teamId);
    if (team.captainUserId !== String(captainUserId)) {
      throw new ForbiddenException('Only the team captain can add members');
    }

    const target = await this.users.findOne({ where: { id: dto.userId } });
    if (!target) throw new NotFoundException(`User ${dto.userId} not found`);
    if (target.role !== UserRole.PLAYER) {
      throw new BadRequestException('Only PLAYER accounts can be added to a team');
    }

    const activeElsewhere = await this.members.findOne({
      where: { userId: dto.userId, status: MemberStatus.ACTIVE },
    });
    if (activeElsewhere) {
      throw new ConflictException('This player is already active on another team');
    }

    const membership = this.members.create({
      teamId,
      userId: dto.userId,
      role: dto.role,
      isSubstitute: dto.isSubstitute ?? false,
      status: MemberStatus.ACTIVE,
    });
    return this.members.save(membership);
  }

  async updateMember(
    teamId: string,
    memberId: string,
    captainUserId: number | string,
    dto: UpdateTeamMemberDto,
  ): Promise<TeamMember> {
    const team = await this.assertTeamExists(teamId);
    if (team.captainUserId !== String(captainUserId)) {
      throw new ForbiddenException('Only the team captain can update members');
    }
    const member = await this.members.findOne({ where: { id: memberId, teamId } });
    if (!member) throw new NotFoundException(`Member ${memberId} not found in team ${teamId}`);
    if (dto.role !== undefined) member.role = dto.role;
    if (dto.isSubstitute !== undefined) member.isSubstitute = dto.isSubstitute;
    return this.members.save(member);
  }

  async removeMember(
    teamId: string,
    memberId: string,
    captainUserId: number | string,
  ): Promise<void> {
    const team = await this.assertTeamExists(teamId);
    if (team.captainUserId !== String(captainUserId)) {
      throw new ForbiddenException('Only the team captain can remove members');
    }
    const member = await this.members.findOne({ where: { id: memberId, teamId } });
    if (!member) throw new NotFoundException(`Member ${memberId} not found in team ${teamId}`);
    if (member.userId === team.captainUserId) {
      throw new BadRequestException('The captain cannot remove themselves');
    }
    member.status = MemberStatus.REMOVED;
    member.leftAt = new Date();
    await this.members.save(member);
  }

  // =========================================================================
  // PRD §6.4 eligibility check — used by Registrations
  // =========================================================================
  async countActiveStarters(teamId: string): Promise<number> {
    return this.members.count({
      where: {
        teamId,
        status: MemberStatus.ACTIVE,
        isSubstitute: false,
      },
    });
  }

  // =========================================================================
  // internal
  // =========================================================================
  private async assertTeamExists(id: string): Promise<Team> {
    const team = await this.teams.findOne({ where: { id } });
    if (!team) throw new NotFoundException(`Team ${id} not found`);
    return team;
  }
}
