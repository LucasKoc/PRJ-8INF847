import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from '../../entities/team-member.entity';
import { Team } from '../../entities/team.entity';
import { User } from '../../entities/user.entity';
import { MemberStatus, UserRole } from '../../common/enums';
import { TeamsService } from '../teams/teams.service';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectRepository(TeamMember)
    private readonly memberRepo: Repository<TeamMember>,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly teamsService: TeamsService,
  ) {}

  listByTeam(teamId: string): Promise<TeamMember[]> {
    return this.memberRepo.find({
      where: { teamId },
      relations: { user: true },
      order: { joinedAt: 'ASC' },
    });
  }

  async add(
    teamId: string,
    requesterUserId: string,
    dto: AddTeamMemberDto,
  ): Promise<TeamMember> {
    const team = await this.teamsService.findById(teamId);
    this.teamsService.assertIsCaptain(team, requesterUserId);

    const newUser = await this.userRepo.findOne({
      where: { id: dto.userId },
    });
    if (!newUser) {
      throw new NotFoundException(`Utilisateur ${dto.userId} introuvable`);
    }
    if (newUser.role !== UserRole.PLAYER) {
      throw new BadRequestException('Seul un PLAYER peut rejoindre une équipe');
    }

    // Un joueur ne peut pas avoir 2 équipes actives
    const activeElsewhere = await this.memberRepo.findOne({
      where: { userId: dto.userId, status: MemberStatus.ACTIVE },
    });
    if (activeElsewhere) {
      throw new BadRequestException(
        `L'utilisateur ${dto.userId} est déjà actif dans une équipe`,
      );
    }

    const member = this.memberRepo.create({
      teamId,
      userId: dto.userId,
      role: dto.role,
      isSubstitute: dto.isSubstitute ?? false,
      status: MemberStatus.ACTIVE,
    });
    return this.memberRepo.save(member);
  }

  async update(
    teamId: string,
    memberId: string,
    requesterUserId: string,
    dto: UpdateTeamMemberDto,
  ): Promise<TeamMember> {
    const team = await this.teamsService.findById(teamId);
    this.teamsService.assertIsCaptain(team, requesterUserId);

    const member = await this.memberRepo.findOne({
      where: { id: memberId, teamId },
    });
    if (!member) {
      throw new NotFoundException('Membre introuvable dans cette équipe');
    }

    if (dto.role !== undefined) member.role = dto.role;
    if (dto.isSubstitute !== undefined) member.isSubstitute = dto.isSubstitute;

    return this.memberRepo.save(member);
  }

  async remove(
    teamId: string,
    memberId: string,
    requesterUserId: string,
    reason: MemberStatus = MemberStatus.REMOVED,
  ): Promise<TeamMember> {
    const team = await this.teamsService.findById(teamId);
    this.teamsService.assertIsCaptain(team, requesterUserId);

    const member = await this.memberRepo.findOne({
      where: { id: memberId, teamId },
    });
    if (!member) {
      throw new NotFoundException('Membre introuvable dans cette équipe');
    }

    if (member.userId === team.captainUserId) {
      throw new BadRequestException(
        'Le capitaine ne peut pas être retiré de son équipe',
      );
    }

    member.status = reason;
    member.leftAt = new Date();
    return this.memberRepo.save(member);
  }
}
