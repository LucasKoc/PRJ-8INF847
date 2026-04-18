import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentRegistration } from '../../entities/tournament-registration.entity';
import { Tournament } from '../../entities/tournament.entity';
import { Team } from '../../entities/team.entity';
import { RegistrationStatus, TournamentStatus } from '../../common/enums';
import { TeamsService } from '../teams/teams.service';
import { RegisterTeamDto } from './dto/register-team.dto';
import { ReviewRegistrationDto } from './dto/review-registration.dto';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(TournamentRegistration)
    private readonly regRepo: Repository<TournamentRegistration>,
    @InjectRepository(Tournament)
    private readonly tournamentRepo: Repository<Tournament>,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    private readonly teamsService: TeamsService,
  ) {}

  listByTournament(tournamentId: string): Promise<TournamentRegistration[]> {
    return this.regRepo.find({
      where: { tournamentId },
      relations: { team: true },
      order: { registeredAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<TournamentRegistration> {
    const reg = await this.regRepo.findOne({
      where: { id },
      relations: { tournament: true, team: true },
    });
    if (!reg) {
      throw new NotFoundException(`Inscription ${id} introuvable`);
    }
    return reg;
  }

  /**
   * Inscription d'une équipe à un tournoi par son capitaine.
   * Vérifie les contraintes métier (reprises côté applicatif, redondantes
   * avec les triggers SQL mais permettent des messages d'erreur plus clairs).
   */
  async register(
    tournamentId: string,
    requesterUserId: string,
    dto: RegisterTeamDto,
  ): Promise<TournamentRegistration> {
    const tournament = await this.tournamentRepo.findOne({
      where: { id: tournamentId },
    });
    if (!tournament) {
      throw new NotFoundException(`Tournoi ${tournamentId} introuvable`);
    }
    if (tournament.status !== TournamentStatus.OPEN) {
      throw new BadRequestException(
        "Le tournoi n'est pas ouvert aux inscriptions",
      );
    }
    if (tournament.registrationDeadline <= new Date()) {
      throw new BadRequestException(
        "La date limite d'inscription est dépassée",
      );
    }

    const team = await this.teamRepo.findOne({ where: { id: dto.teamId } });
    if (!team) {
      throw new NotFoundException(`Équipe ${dto.teamId} introuvable`);
    }
    if (team.captainUserId !== requesterUserId) {
      throw new ForbiddenException(
        'Seul le capitaine peut inscrire son équipe',
      );
    }

    const starters = await this.teamsService.countActiveStarters(team.id);
    if (starters < 5) {
      throw new BadRequestException(
        `L'équipe doit compter au moins 5 joueurs titulaires actifs (actuellement : ${starters})`,
      );
    }

    const alreadyRegistered = await this.regRepo.findOne({
      where: { tournamentId, teamId: team.id },
    });
    if (alreadyRegistered) {
      throw new BadRequestException('Cette équipe est déjà inscrite');
    }

    const currentCount = await this.regRepo.count({ where: { tournamentId } });
    if (currentCount >= tournament.maxTeams) {
      throw new BadRequestException(
        `Le tournoi a atteint son nombre maximal d'équipes (${tournament.maxTeams})`,
      );
    }

    const registration = this.regRepo.create({
      tournamentId,
      teamId: team.id,
      status: RegistrationStatus.PENDING,
    });
    return this.regRepo.save(registration);
  }

  /**
   * Arbitrage d'une inscription par l'organisateur du tournoi.
   */
  async review(
    registrationId: string,
    reviewerUserId: string,
    dto: ReviewRegistrationDto,
  ): Promise<TournamentRegistration> {
    const reg = await this.findById(registrationId);

    if (reg.tournament.organizerUserId !== reviewerUserId) {
      throw new ForbiddenException(
        "Seul l'organisateur du tournoi peut arbitrer cette inscription",
      );
    }
    if (reg.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException(
        `Inscription déjà traitée (statut : ${reg.status})`,
      );
    }

    reg.status = dto.status;
    reg.reviewedAt = new Date();
    reg.reviewedBy = reviewerUserId;
    reg.reviewNote = dto.reviewNote ?? null;
    return this.regRepo.save(reg);
  }

  /**
   * Annulation d'une inscription par le capitaine de l'équipe.
   */
  async cancel(
    registrationId: string,
    requesterUserId: string,
  ): Promise<TournamentRegistration> {
    const reg = await this.findById(registrationId);

    if (reg.team.captainUserId !== requesterUserId) {
      throw new ForbiddenException(
        "Seul le capitaine de l'équipe peut annuler cette inscription",
      );
    }
    if (
      reg.status !== RegistrationStatus.PENDING &&
      reg.status !== RegistrationStatus.APPROVED
    ) {
      throw new BadRequestException('Inscription déjà annulée ou rejetée');
    }

    reg.status = RegistrationStatus.CANCELLED;
    reg.reviewedAt = new Date();
    return this.regRepo.save(reg);
  }
}
