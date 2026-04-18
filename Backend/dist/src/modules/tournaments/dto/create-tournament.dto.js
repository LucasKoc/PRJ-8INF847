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
exports.CreateTournamentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateTournamentDto {
    name;
    game;
    format;
    registrationDeadline;
    startsAt;
    endsAt;
    maxTeams;
}
exports.CreateTournamentDto = CreateTournamentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'UQAR Summer Cup 2026', minLength: 3, maxLength: 120 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'League of Legends',
        default: 'League of Legends',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "game", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Single Elimination BO1', maxLength: 50 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-15T00:00:00Z' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateTournamentDto.prototype, "registrationDeadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-20T18:00:00Z' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateTournamentDto.prototype, "startsAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-05-22T23:00:00Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateTournamentDto.prototype, "endsAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 16, minimum: 2 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    __metadata("design:type", Number)
], CreateTournamentDto.prototype, "maxTeams", void 0);
//# sourceMappingURL=create-tournament.dto.js.map