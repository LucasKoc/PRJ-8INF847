"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tournament_entity_1 = require("../../entities/tournament.entity");
const enums_1 = require("../../common/enums");
const ALLOWED_TRANSITIONS = {
    [enums_1.TournamentStatus.DRAFT]: [enums_1.TournamentStatus.OPEN, enums_1.TournamentStatus.CANCELLED],
    [enums_1.TournamentStatus.OPEN]: [
        enums_1.TournamentStatus.CLOSED,
        enums_1.TournamentStatus.CANCELLED,
    ],
    [enums_1.TournamentStatus.CLOSED]: [enums_1.TournamentStatus.COMPLETED],
    [enums_1.TournamentStatus.CANCELLED]: [],
    [enums_1.TournamentStatus.COMPLETED]: [],
};
let TournamentsService = class TournamentsService {
    tournamentRepo;
    constructor(tournamentRepo) {
        this.tournamentRepo = tournamentRepo;
    }
    findAll() {
        return this.tournamentRepo.find({
            relations: { organizer: true },
            order: { startsAt: 'ASC' },
        });
    }
    async findById(id) {
        const tournament = await this.tournamentRepo.findOne({
            where: { id },
            relations: { organizer: true, registrations: { team: true } },
        });
        if (!tournament) {
            throw new common_1.NotFoundException(`Tournoi ${id} introuvable`);
        }
        return tournament;
    }
    async create(organizerUserId, dto) {
        this.validateDates(dto.registrationDeadline, dto.startsAt, dto.endsAt ?? null);
        const tournament = this.tournamentRepo.create({
            ...dto,
            game: dto.game ?? 'League of Legends',
            organizerUserId,
            status: enums_1.TournamentStatus.DRAFT,
        });
        return this.tournamentRepo.save(tournament);
    }
    async update(id, requesterUserId, dto) {
        const tournament = await this.findById(id);
        this.assertIsOrganizer(tournament, requesterUserId);
        if (tournament.status !== enums_1.TournamentStatus.DRAFT) {
            throw new common_1.BadRequestException('Seul un tournoi en statut DRAFT peut être modifié');
        }
        Object.assign(tournament, dto);
        this.validateDates(tournament.registrationDeadline, tournament.startsAt, tournament.endsAt ?? null);
        return this.tournamentRepo.save(tournament);
    }
    async changeStatus(id, requesterUserId, next) {
        const tournament = await this.findById(id);
        this.assertIsOrganizer(tournament, requesterUserId);
        const allowed = ALLOWED_TRANSITIONS[tournament.status];
        if (!allowed.includes(next)) {
            throw new common_1.BadRequestException(`Transition ${tournament.status} → ${next} non autorisée`);
        }
        tournament.status = next;
        return this.tournamentRepo.save(tournament);
    }
    async remove(id, requesterUserId) {
        const tournament = await this.findById(id);
        this.assertIsOrganizer(tournament, requesterUserId);
        if (tournament.status !== enums_1.TournamentStatus.DRAFT) {
            throw new common_1.BadRequestException('Seul un tournoi DRAFT peut être supprimé. Utilisez CANCELLED sinon.');
        }
        await this.tournamentRepo.remove(tournament);
    }
    assertIsOrganizer(tournament, requesterUserId) {
        if (tournament.organizerUserId !== requesterUserId) {
            throw new common_1.ForbiddenException("Seul l'organisateur peut gérer ce tournoi");
        }
    }
    validateDates(registrationDeadline, startsAt, endsAt) {
        const now = new Date();
        if (startsAt <= now) {
            throw new common_1.BadRequestException('La date de début doit être postérieure à la date actuelle');
        }
        if (registrationDeadline >= startsAt) {
            throw new common_1.BadRequestException("La date limite d'inscription doit précéder la date de début");
        }
        if (endsAt && endsAt < startsAt) {
            throw new common_1.BadRequestException('La date de fin doit être postérieure ou égale à la date de début');
        }
    }
};
exports.TournamentsService = TournamentsService;
exports.TournamentsService = TournamentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tournament_entity_1.Tournament)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TournamentsService);
//# sourceMappingURL=tournaments.service.js.map