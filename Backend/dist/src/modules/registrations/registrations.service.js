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
exports.RegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tournament_registration_entity_1 = require("../../entities/tournament-registration.entity");
const tournament_entity_1 = require("../../entities/tournament.entity");
const team_entity_1 = require("../../entities/team.entity");
const enums_1 = require("../../common/enums");
const teams_service_1 = require("../teams/teams.service");
let RegistrationsService = class RegistrationsService {
    regRepo;
    tournamentRepo;
    teamRepo;
    teamsService;
    constructor(regRepo, tournamentRepo, teamRepo, teamsService) {
        this.regRepo = regRepo;
        this.tournamentRepo = tournamentRepo;
        this.teamRepo = teamRepo;
        this.teamsService = teamsService;
    }
    listByTournament(tournamentId) {
        return this.regRepo.find({
            where: { tournamentId },
            relations: { team: true },
            order: { registeredAt: 'ASC' },
        });
    }
    async findById(id) {
        const reg = await this.regRepo.findOne({
            where: { id },
            relations: { tournament: true, team: true },
        });
        if (!reg) {
            throw new common_1.NotFoundException(`Inscription ${id} introuvable`);
        }
        return reg;
    }
    async register(tournamentId, requesterUserId, dto) {
        const tournament = await this.tournamentRepo.findOne({
            where: { id: tournamentId },
        });
        if (!tournament) {
            throw new common_1.NotFoundException(`Tournoi ${tournamentId} introuvable`);
        }
        if (tournament.status !== enums_1.TournamentStatus.OPEN) {
            throw new common_1.BadRequestException("Le tournoi n'est pas ouvert aux inscriptions");
        }
        if (tournament.registrationDeadline <= new Date()) {
            throw new common_1.BadRequestException("La date limite d'inscription est dépassée");
        }
        const team = await this.teamRepo.findOne({ where: { id: dto.teamId } });
        if (!team) {
            throw new common_1.NotFoundException(`Équipe ${dto.teamId} introuvable`);
        }
        if (team.captainUserId !== requesterUserId) {
            throw new common_1.ForbiddenException('Seul le capitaine peut inscrire son équipe');
        }
        const starters = await this.teamsService.countActiveStarters(team.id);
        if (starters < 5) {
            throw new common_1.BadRequestException(`L'équipe doit compter au moins 5 joueurs titulaires actifs (actuellement : ${starters})`);
        }
        const alreadyRegistered = await this.regRepo.findOne({
            where: { tournamentId, teamId: team.id },
        });
        if (alreadyRegistered) {
            throw new common_1.BadRequestException('Cette équipe est déjà inscrite');
        }
        const currentCount = await this.regRepo.count({ where: { tournamentId } });
        if (currentCount >= tournament.maxTeams) {
            throw new common_1.BadRequestException(`Le tournoi a atteint son nombre maximal d'équipes (${tournament.maxTeams})`);
        }
        const registration = this.regRepo.create({
            tournamentId,
            teamId: team.id,
            status: enums_1.RegistrationStatus.PENDING,
        });
        return this.regRepo.save(registration);
    }
    async review(registrationId, reviewerUserId, dto) {
        const reg = await this.findById(registrationId);
        if (reg.tournament.organizerUserId !== reviewerUserId) {
            throw new common_1.ForbiddenException("Seul l'organisateur du tournoi peut arbitrer cette inscription");
        }
        if (reg.status !== enums_1.RegistrationStatus.PENDING) {
            throw new common_1.BadRequestException(`Inscription déjà traitée (statut : ${reg.status})`);
        }
        reg.status = dto.status;
        reg.reviewedAt = new Date();
        reg.reviewedBy = reviewerUserId;
        reg.reviewNote = dto.reviewNote ?? null;
        return this.regRepo.save(reg);
    }
    async cancel(registrationId, requesterUserId) {
        const reg = await this.findById(registrationId);
        if (reg.team.captainUserId !== requesterUserId) {
            throw new common_1.ForbiddenException("Seul le capitaine de l'équipe peut annuler cette inscription");
        }
        if (reg.status !== enums_1.RegistrationStatus.PENDING &&
            reg.status !== enums_1.RegistrationStatus.APPROVED) {
            throw new common_1.BadRequestException('Inscription déjà annulée ou rejetée');
        }
        reg.status = enums_1.RegistrationStatus.CANCELLED;
        reg.reviewedAt = new Date();
        return this.regRepo.save(reg);
    }
};
exports.RegistrationsService = RegistrationsService;
exports.RegistrationsService = RegistrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tournament_registration_entity_1.TournamentRegistration)),
    __param(1, (0, typeorm_1.InjectRepository)(tournament_entity_1.Tournament)),
    __param(2, (0, typeorm_1.InjectRepository)(team_entity_1.Team)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        teams_service_1.TeamsService])
], RegistrationsService);
//# sourceMappingURL=registrations.service.js.map