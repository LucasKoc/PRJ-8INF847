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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentRegistration = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const tournament_entity_1 = require("./tournament.entity");
const team_entity_1 = require("./team.entity");
const user_entity_1 = require("./user.entity");
let TournamentRegistration = class TournamentRegistration {
    id;
    tournamentId;
    tournament;
    teamId;
    team;
    status;
    registeredAt;
    reviewedAt;
    reviewedBy;
    reviewer;
    reviewNote;
};
exports.TournamentRegistration = TournamentRegistration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], TournamentRegistration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tournament_id', type: 'bigint' }),
    __metadata("design:type", String)
], TournamentRegistration.prototype, "tournamentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tournament_entity_1.Tournament, (tournament) => tournament.registrations, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'tournament_id' }),
    __metadata("design:type", tournament_entity_1.Tournament)
], TournamentRegistration.prototype, "tournament", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', type: 'bigint' }),
    __metadata("design:type", String)
], TournamentRegistration.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.registrations, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], TournamentRegistration.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.RegistrationStatus,
        default: enums_1.RegistrationStatus.PENDING,
    }),
    __metadata("design:type", String)
], TournamentRegistration.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'registered_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TournamentRegistration.prototype, "registeredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], TournamentRegistration.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_by', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], TournamentRegistration.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewed_by' }),
    __metadata("design:type", Object)
], TournamentRegistration.prototype, "reviewer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_note', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], TournamentRegistration.prototype, "reviewNote", void 0);
exports.TournamentRegistration = TournamentRegistration = __decorate([
    (0, typeorm_1.Entity)('tournament_registrations'),
    (0, typeorm_1.Unique)('uq_tournament_team', ['tournamentId', 'teamId'])
], TournamentRegistration);
//# sourceMappingURL=tournament-registration.entity.js.map