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

/**
 * Transitions autorisées du cycle de vie d'un tournoi.
 * DRAFT → OPEN → CLOSED → COMPLETED
 * DRAFT/OPEN → CANCELLED (coupure)
 */
const ALLOWED_TRANSITIONS: Record<TournamentStatus, TournamentStatus[]> = {
  [TournamentStatus.DRAFT]: [TournamentStatus.OPEN, TournamentStatus.CANCELLED],
  [TournamentStatus.OPEN]: [
    TournamentStatus.CLOSED,
    TournamentStatus.CANCELLED,
  ],
  [TournamentStatus.CLOSED]: [TournamentStatus.COMPLETED],
  [TournamentStatus.CANCELLED]: [],
  [TournamentStatus.COMPLETED]: [],
};

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepo: Repository<Tournament>,
  ) {}

  findAll(): Promise<Tournament[]> {
    return this.tournamentRepo.find({
      relations: { organizer: true },
      order: { startsAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<Tournament> {
    const tournament = await this.tournamentRepo.findOne({
      where: { id },
      relations: { organizer: true, registrations: { team: true } },
    });
    if (!tournament) {
      throw new NotFoundException(`Tournoi ${id} introuvable`);
    }
    return tournament;
  }

  async create(
    organizerUserId: string,
    dto: CreateTournamentDto,
  ): Promise<Tournament> {
    this.validateDates(
      dto.registrationDeadline,
      dto.startsAt,
      dto.endsAt ?? null,
    );

    const tournament = this.tournamentRepo.create({
      ...dto,
      game: dto.game ?? 'League of Legends',
      organizerUserId,
      status: TournamentStatus.DRAFT,
    });
    return this.tournamentRepo.save(tournament);
  }

  async update(
    id: string,
    requesterUserId: string,
    dto: UpdateTournamentDto,
  ): Promise<Tournament> {
    const tournament = await this.findById(id);
    this.assertIsOrganizer(tournament, requesterUserId);

    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new BadRequestException(
        'Seul un tournoi en statut DRAFT peut être modifié',
      );
    }

    Object.assign(tournament, dto);
    this.validateDates(
      tournament.registrationDeadline,
      tournament.startsAt,
      tournament.endsAt ?? null,
    );
    return this.tournamentRepo.save(tournament);
  }

  async changeStatus(
    id: string,
    requesterUserId: string,
    next: TournamentStatus,
  ): Promise<Tournament> {
    const tournament = await this.findById(id);
    this.assertIsOrganizer(tournament, requesterUserId);

    const allowed = ALLOWED_TRANSITIONS[tournament.status];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Transition ${tournament.status} → ${next} non autorisée`,
      );
    }

    tournament.status = next;
    return this.tournamentRepo.save(tournament);
  }

  async remove(id: string, requesterUserId: string): Promise<void> {
    const tournament = await this.findById(id);
    this.assertIsOrganizer(tournament, requesterUserId);

    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new BadRequestException(
        'Seul un tournoi DRAFT peut être supprimé. Utilisez CANCELLED sinon.',
      );
    }
    await this.tournamentRepo.remove(tournament);
  }

  assertIsOrganizer(tournament: Tournament, requesterUserId: string): void {
    if (tournament.organizerUserId !== requesterUserId) {
      throw new ForbiddenException(
        "Seul l'organisateur peut gérer ce tournoi",
      );
    }
  }

  private validateDates(
    registrationDeadline: Date,
    startsAt: Date,
    endsAt: Date | null,
  ): void {
    const now = new Date();
    if (startsAt <= now) {
      throw new BadRequestException(
        'La date de début doit être postérieure à la date actuelle',
      );
    }
    if (registrationDeadline >= startsAt) {
      throw new BadRequestException(
        "La date limite d'inscription doit précéder la date de début",
      );
    }
    if (endsAt && endsAt < startsAt) {
      throw new BadRequestException(
        'La date de fin doit être postérieure ou égale à la date de début',
      );
    }
  }
}
