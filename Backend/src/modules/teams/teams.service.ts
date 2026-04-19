import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { User } from '../../entities/user.entity';
import { LolRole, MemberStatus, UserRole } from '../../common/enums';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly memberRepo: Repository<TeamMember>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<Team[]> {
    return this.teamRepo.find({
      relations: { captain: true, members: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Team> {
    const team = await this.teamRepo.findOne({
      where: { id },
      relations: { captain: true, members: { user: true } },
    });
    if (!team) {
      throw new NotFoundException(`Équipe ${id} introuvable`);
    }
    return team;
  }

  /**
   * Création d'une équipe par un joueur qui devient capitaine.
   * Transaction : création équipe + ajout capitaine comme membre ACTIVE.
   */
  async create(captainUserId: string, dto: CreateTeamDto): Promise<Team> {
    const captain = await this.userRepo.findOne({
      where: { id: captainUserId },
    });
    if (!captain) {
      throw new NotFoundException(`Utilisateur ${captainUserId} introuvable`);
    }
    if (captain.role !== UserRole.PLAYER) {
      throw new ForbiddenException('Seul un PLAYER peut créer une équipe');
    }

    // Un joueur ne peut pas appartenir à deux équipes en même temps
    const alreadyActive = await this.memberRepo.findOne({
      where: { userId: captainUserId, status: MemberStatus.ACTIVE },
    });
    if (alreadyActive) {
      throw new BadRequestException('Vous appartenez déjà activement à une équipe');
    }

    return this.dataSource.transaction(async manager => {
      const team = manager.create(Team, {
        name: dto.name,
        tag: dto.tag.toUpperCase(),
        captainUserId,
      });
      const savedTeam = await manager.save(team);

      const captainMember = manager.create(TeamMember, {
        teamId: savedTeam.id,
        userId: captainUserId,
        role: LolRole.FLEX,
        isSubstitute: false,
        status: MemberStatus.ACTIVE,
      });
      await manager.save(captainMember);

      return savedTeam;
    });
  }

  async update(id: string, requesterUserId: string, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.findById(id);
    this.assertIsCaptain(team, requesterUserId);

    if (dto.name !== undefined) team.name = dto.name;
    if (dto.tag !== undefined) team.tag = dto.tag.toUpperCase();
    return this.teamRepo.save(team);
  }

  async remove(id: string, requesterUserId: string): Promise<void> {
    const team = await this.findById(id);
    this.assertIsCaptain(team, requesterUserId);
    await this.teamRepo.remove(team);
  }

  /**
   * Vérifie qu'une équipe a au moins 5 joueurs actifs titulaires.
   * Utilisé avant l'inscription à un tournoi.
   */
  async countActiveStarters(teamId: string): Promise<number> {
    return this.memberRepo.count({
      where: {
        teamId,
        status: MemberStatus.ACTIVE,
        isSubstitute: false,
      },
    });
  }

  assertIsCaptain(team: Team, requesterUserId: string): void {
    if (team.captainUserId !== requesterUserId) {
      throw new ForbiddenException('Seul le capitaine peut effectuer cette action');
    }
  }
}
