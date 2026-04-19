import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { TournamentRegistration } from '../../entities/tournament-registration.entity';
import { Tournament } from '../../entities/tournament.entity';
import { Team } from '../../entities/team.entity';
import { RegistrationStatus, TournamentStatus } from '../../common/enums';
import { TeamsService } from '../teams/teams.service';
import { ReviewRegistrationDto } from './dto/review-registration.dto';

const MIN_STARTERS = 5;

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(TournamentRegistration)
    private readonly regs: Repository<TournamentRegistration>,
    @InjectRepository(Tournament) private readonly tournaments: Repository<Tournament>,
    @InjectRepository(Team) private readonly teams: Repository<Team>,
    private readonly teamsService: TeamsService,
  ) {}

  async listForTournament(tournamentId: string): Promise<TournamentRegistration[]> {
    return this.regs.find({
      where: { tournamentId },
      relations: { team: { captain: true } },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Captain submits their team.
   * Tournament OPEN, deadline not passed, team eligible,
   * not already registered, max teams not reached.
   */
  async register(
    tournamentId: string,
    teamId: string,
    callerId: number | string,
  ): Promise<TournamentRegistration> {
    const tournament = await this.tournaments.findOne({ where: { id: tournamentId } });
    if (!tournament) throw new NotFoundException(`Tournament ${tournamentId} not found`);

    if (tournament.status !== TournamentStatus.OPEN) {
      throw new BadRequestException(
        `Tournament is not open for registration (current status: ${tournament.status})`,
      );
    }

    // Status can be OPEN but deadline already passed → still block new registrations.
    const now = new Date();
    if (tournament.registrationDeadline <= now) {
      throw new BadRequestException('Registration deadline has passed for this tournament');
    }

    const team = await this.teams.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException(`Team ${teamId} not found`);
    if (team.captainUserId !== String(callerId)) {
      throw new ForbiddenException('Only the team captain can register the team');
    }

    // Eligibility — minimum 5 active non-substitute starters
    const starters = await this.teamsService.countActiveStarters(teamId);
    if (starters < MIN_STARTERS) {
      throw new BadRequestException(
        `Team has ${starters} of ${MIN_STARTERS} required active starters. Add more members before registering.`,
      );
    }

    // Not already registered for this tournament (in a non-cancelled/non-rejected state)
    const existing = await this.regs.findOne({
      where: {
        tournamentId,
        teamId,
        status: Not(RegistrationStatus.CANCELLED) as never,
      },
    });
    if (existing && existing.status !== RegistrationStatus.REJECTED) {
      throw new ConflictException('This team is already registered for this tournament');
    }

    // Max teams check — count non-cancelled, non-rejected registrations
    const activeCount = await this.regs.count({
      where: [
        { tournamentId, status: RegistrationStatus.PENDING },
        { tournamentId, status: RegistrationStatus.APPROVED },
      ],
    });
    if (activeCount >= tournament.maxTeams) {
      throw new BadRequestException(
        `Tournament has reached its maximum of ${tournament.maxTeams} teams`,
      );
    }

    const registration = this.regs.create({
      tournamentId,
      teamId,
      status: RegistrationStatus.PENDING,
    });
    return this.regs.save(registration);
  }

  /**
   * TO reviews a PENDING registration → APPROVED or REJECTED.
   */
  async review(
    registrationId: string,
    reviewerUserId: number | string,
    dto: ReviewRegistrationDto,
  ): Promise<TournamentRegistration> {
    const registration = await this.regs.findOne({
      where: { id: registrationId },
      relations: { tournament: true },
    });
    if (!registration) throw new NotFoundException(`Registration ${registrationId} not found`);
    if (!registration.tournament) throw new NotFoundException('Parent tournament not found');

    if (registration.tournament.organizerUserId !== String(reviewerUserId)) {
      throw new ForbiddenException('Only the organizing TO can review registrations');
    }
    if (registration.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException(
        `Registration has already been reviewed (current status: ${registration.status})`,
      );
    }

    registration.status = dto.status;
    registration.reviewNote = dto.reviewNote ?? null;
    registration.reviewedByUserId = String(reviewerUserId);
    registration.reviewedAt = new Date();
    return this.regs.save(registration);
  }

  /**
   * Captain cancels a PENDING or APPROVED registration.
   */
  async cancel(registrationId: string, callerId: number | string): Promise<TournamentRegistration> {
    const registration = await this.regs.findOne({
      where: { id: registrationId },
      relations: { team: true, tournament: true },
    });
    if (!registration) throw new NotFoundException(`Registration ${registrationId} not found`);
    if (!registration.team || !registration.tournament) {
      throw new NotFoundException('Related team or tournament not found');
    }

    if (registration.team.captainUserId !== String(callerId)) {
      throw new ForbiddenException('Only the team captain can cancel this registration');
    }

    if (
      registration.status !== RegistrationStatus.PENDING &&
      registration.status !== RegistrationStatus.APPROVED
    ) {
      throw new BadRequestException(
        `Registration cannot be cancelled (current status: ${registration.status})`,
      );
    }

    // Cannot cancel after the registration deadline has passed.
    const now = new Date();
    if (registration.tournament.registrationDeadline <= now) {
      throw new BadRequestException(
        'Cannot cancel registration after the registration deadline has passed',
      );
    }

    registration.status = RegistrationStatus.CANCELLED;
    registration.reviewedAt = new Date();
    return this.regs.save(registration);
  }
}
