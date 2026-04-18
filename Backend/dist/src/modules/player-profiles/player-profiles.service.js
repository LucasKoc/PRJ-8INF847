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
exports.PlayerProfilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const player_profile_entity_1 = require("../../entities/player-profile.entity");
const user_entity_1 = require("../../entities/user.entity");
const enums_1 = require("../../common/enums");
let PlayerProfilesService = class PlayerProfilesService {
    profileRepo;
    userRepo;
    constructor(profileRepo, userRepo) {
        this.profileRepo = profileRepo;
        this.userRepo = userRepo;
    }
    findAll() {
        return this.profileRepo.find({ order: { createdAt: 'DESC' } });
    }
    async findByUserId(userId) {
        const profile = await this.profileRepo.findOne({ where: { userId } });
        if (!profile) {
            throw new common_1.NotFoundException(`Aucun profil joueur pour l'utilisateur ${userId}`);
        }
        return profile;
    }
    async create(userId, dto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur ${userId} introuvable`);
        }
        if (user.role !== enums_1.UserRole.PLAYER) {
            throw new common_1.BadRequestException('Seul un utilisateur de rôle PLAYER peut créer un profil joueur');
        }
        const existing = await this.profileRepo.findOne({ where: { userId } });
        if (existing) {
            throw new common_1.ConflictException('Un profil joueur existe déjà');
        }
        const profile = this.profileRepo.create({ ...dto, userId });
        return this.profileRepo.save(profile);
    }
    async update(userId, dto) {
        const profile = await this.findByUserId(userId);
        Object.assign(profile, dto);
        return this.profileRepo.save(profile);
    }
    async remove(userId) {
        const profile = await this.findByUserId(userId);
        await this.profileRepo.remove(profile);
    }
};
exports.PlayerProfilesService = PlayerProfilesService;
exports.PlayerProfilesService = PlayerProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(player_profile_entity_1.PlayerProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PlayerProfilesService);
//# sourceMappingURL=player-profiles.service.js.map