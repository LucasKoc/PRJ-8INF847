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
exports.Tournament = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const user_entity_1 = require("./user.entity");
const tournament_registration_entity_1 = require("./tournament-registration.entity");
let Tournament = class Tournament {
    id;
    organizerUserId;
    organizer;
    name;
    game;
    format;
    registrationDeadline;
    startsAt;
    endsAt;
    maxTeams;
    status;
    createdAt;
    updatedAt;
    registrations;
};
exports.Tournament = Tournament;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Tournament.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organizer_user_id', type: 'bigint' }),
    __metadata("design:type", String)
], Tournament.prototype, "organizerUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.organizedTournaments, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'organizer_user_id' }),
    __metadata("design:type", user_entity_1.User)
], Tournament.prototype, "organizer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], Tournament.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'League of Legends' }),
    __metadata("design:type", String)
], Tournament.prototype, "game", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Tournament.prototype, "format", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registration_deadline', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Tournament.prototype, "registrationDeadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'starts_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Tournament.prototype, "startsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ends_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Tournament.prototype, "endsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_teams', type: 'integer' }),
    __metadata("design:type", Number)
], Tournament.prototype, "maxTeams", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.TournamentStatus, default: enums_1.TournamentStatus.DRAFT }),
    __metadata("design:type", String)
], Tournament.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Tournament.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Tournament.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tournament_registration_entity_1.TournamentRegistration, (reg) => reg.tournament),
    __metadata("design:type", Array)
], Tournament.prototype, "registrations", void 0);
exports.Tournament = Tournament = __decorate([
    (0, typeorm_1.Entity)('tournaments')
], Tournament);
//# sourceMappingURL=tournament.entity.js.map