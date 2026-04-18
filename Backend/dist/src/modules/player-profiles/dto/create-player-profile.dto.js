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
exports.CreatePlayerProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../../common/enums");
class CreatePlayerProfileDto {
    summonerName;
    tagLine;
    region;
    rank;
    mainRole;
    bio;
}
exports.CreatePlayerProfileDto = CreatePlayerProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Caliste', minLength: 3, maxLength: 50 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreatePlayerProfileDto.prototype, "summonerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EUW', minLength: 2, maxLength: 10 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(10),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9]+$/, {
        message: 'tagLine : lettres et chiffres uniquement',
    }),
    __metadata("design:type", String)
], CreatePlayerProfileDto.prototype, "tagLine", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EUW1', maxLength: 20 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreatePlayerProfileDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Diamond II' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], CreatePlayerProfileDto.prototype, "rank", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enums_1.LolRole }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.LolRole),
    __metadata("design:type", String)
], CreatePlayerProfileDto.prototype, "mainRole", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Main ADC depuis S9.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlayerProfileDto.prototype, "bio", void 0);
//# sourceMappingURL=create-player-profile.dto.js.map