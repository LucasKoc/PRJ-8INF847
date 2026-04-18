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
exports.PlayerProfile = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const user_entity_1 = require("./user.entity");
let PlayerProfile = class PlayerProfile {
    id;
    userId;
    user;
    summonerName;
    tagLine;
    region;
    rank;
    mainRole;
    bio;
    createdAt;
    updatedAt;
};
exports.PlayerProfile = PlayerProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], PlayerProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'bigint', unique: true }),
    __metadata("design:type", String)
], PlayerProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.playerProfile, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], PlayerProfile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'summoner_name', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], PlayerProfile.prototype, "summonerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tag_line', type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], PlayerProfile.prototype, "tagLine", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], PlayerProfile.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", Object)
], PlayerProfile.prototype, "rank", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'main_role', type: 'enum', enum: enums_1.LolRole, nullable: true }),
    __metadata("design:type", Object)
], PlayerProfile.prototype, "mainRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PlayerProfile.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PlayerProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PlayerProfile.prototype, "updatedAt", void 0);
exports.PlayerProfile = PlayerProfile = __decorate([
    (0, typeorm_1.Entity)('player_profiles'),
    (0, typeorm_1.Unique)('uq_player_profile_identity', ['summonerName', 'tagLine', 'region'])
], PlayerProfile);
//# sourceMappingURL=player-profile.entity.js.map