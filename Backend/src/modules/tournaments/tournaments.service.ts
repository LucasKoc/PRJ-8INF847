import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from '../../entities/tournament.entity';
import { TournamentStatus } from '../../common/enums';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

// Valid status transitions (mirror of PRD §6.5 + DB trigger)
const ALLOWED_TRANSITIONS: Record<TournamentStatus, TournamentStatus[]> = {
  [TournamentStatus.DRAFT]: [TournamentStatus.OPEN, TournamentStatus.CANCELLED],
  [TournamentStatus.OPEN]: [TournamentStatus.CLOSED, TournamentStatus.CANCELLED],
  [TournamentStatus.CLOSED]: [TournamentStatus.COMPLETED],
  [TournamentStatus.CANCELLED]: [],
  [TournamentStatus.COMPLETED]: [],
};

@Injectable()
export class TournamentsService {
  constructor(@InjectRepository(Tournament) private readonly tournaments: Repository<Tournament>) {}

  // =========================================================================
  // READ
  // =========================================================================

  /**
   * Gap-analysis Fix #2 — PRD §6.2
   * Public list excludes DRAFT tournaments, but an authenticated TO also sees
   * their own drafts. callerId is undefined for anonymous visitors.
   */
  async findAll(callerId?: string): Promise<Tournament[]> {
    const qb = this.tournaments
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.organizer', 'o')
      .orderBy('t.startsAt', 'ASC');

    if (callerId) {
      qb.where('(t.status != :draft OR t.organizerUserId = :me)', {
        draft: TournamentStatus.DRAFT,
        me: callerId,
      });
    } else {
      qb.where('t.status != :draft', { draft: TournamentStatus.DRAFT });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Tournament> {
    const tournament = await this.tournaments.findOne({
      where: { id },
      relations: {
        organizer: true,
        registrations: { team: { captain: true } },
      },
    });
    if (!tournament) throw new NotFoundException(`Tournament ${id} not found`);
    return tournament;
  }

  // =========================================================================
  // CREATE / UPDATE
  // =========================================================================

  async create(organizerUserId: number | string, dto: CreateTournamentDto): Promise<Tournament> {
    const registrationDeadline = new Date(dto.registrationDeadline);
    const startsAt = new Date(dto.startsAt);
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : null;

    if (registrationDeadline >= startsAt) {
      throw new BadRequestException('Registration deadline must precede the start date');
    }
    if (endsAt && endsAt <= startsAt) {
      throw new BadRequestException('End date must be after the start date');
    }

    const tournament = this.tournaments.create({
      organizerUserId: String(organizerUserId),
      name: dto.name.trim(),
      game: dto.game ?? 'League of Legends',
      format: dto.format,
      registrationDeadline,
      startsAt,
      endsAt,
      maxTeams: dto.maxTeams,
      status: TournamentStatus.DRAFT,
    });
    return this.tournaments.save(tournament);
  }

  async update(
    id: string,
    callerId: number | string,
    dto: UpdateTournamentDto,
  ): Promise<Tournament> {
    const tournament = await this.findOne(id);
    this.assertOwnership(tournament, callerId);

    // PRD §6.5: edits only allowed while DRAFT
    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new BadRequestException(
        'Tournament can only be edited while in DRAFT. Once OPEN, tournaments are locked.',
      );
    }

    if (dto.name !== undefined) tournament.name = dto.name.trim();
    if (dto.game !== undefined) tournament.game = dto.game;
    if (dto.format !== undefined) tournament.format = dto.format;
    if (dto.registrationDeadline !== undefined) {
      tournament.registrationDeadline = new Date(dto.registrationDeadline);
    }
    if (dto.startsAt !== undefined) tournament.startsAt = new Date(dto.startsAt);
    if (dto.endsAt !== undefined) {
      tournament.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    }
    if (dto.maxTeams !== undefined) tournament.maxTeams = dto.maxTeams;

    if (tournament.registrationDeadline >= tournament.startsAt) {
      throw new BadRequestException('Registration deadline must precede the start date');
    }

    return this.tournaments.save(tournament);
  }

  // =========================================================================
  // STATUS LIFECYCLE
  // =========================================================================

  async changeStatus(
    id: string,
    callerId: number | string,
    next: TournamentStatus,
  ): Promise<Tournament> {
    const tournament = await this.findOne(id);
    this.assertOwnership(tournament, callerId);

    const allowed = ALLOWED_TRANSITIONS[tournament.status];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Cannot transition from ${tournament.status} to ${next}. Allowed next states: [${allowed.join(', ') || 'none'}]`,
      );
    }
    tournament.status = next;
    return this.tournaments.save(tournament);
  }

  // =========================================================================
  // internal
  // =========================================================================

  private assertOwnership(tournament: Tournament, callerId: number | string): void {
    if (tournament.organizerUserId !== String(callerId)) {
      throw new ForbiddenException('Only the organizing TO can perform this action');
    }
  }
}
