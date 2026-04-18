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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const team_entity_1 = require("../../entities/team.entity");
const team_member_entity_1 = require("../../entities/team-member.entity");
const user_entity_1 = require("../../entities/user.entity");
const enums_1 = require("../../common/enums");
let TeamsService = class TeamsService {
    teamRepo;
    memberRepo;
    userRepo;
    dataSource;
    constructor(teamRepo, memberRepo, userRepo, dataSource) {
        this.teamRepo = teamRepo;
        this.memberRepo = memberRepo;
        this.userRepo = userRepo;
        this.dataSource = dataSource;
    }
    findAll() {
        return this.teamRepo.find({
            relations: { captain: true, members: true },
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        const team = await this.teamRepo.findOne({
            where: { id },
            relations: { captain: true, members: { user: true } },
        });
        if (!team) {
            throw new common_1.NotFoundException(`Équipe ${id} introuvable`);
        }
        return team;
    }
    async create(captainUserId, dto) {
        const captain = await this.userRepo.findOne({
            where: { id: captainUserId },
        });
        if (!captain) {
            throw new common_1.NotFoundException(`Utilisateur ${captainUserId} introuvable`);
        }
        if (captain.role !== enums_1.UserRole.PLAYER) {
            throw new common_1.ForbiddenException('Seul un PLAYER peut créer une équipe');
        }
        const alreadyActive = await this.memberRepo.findOne({
            where: { userId: captainUserId, status: enums_1.MemberStatus.ACTIVE },
        });
        if (alreadyActive) {
            throw new common_1.BadRequestException('Vous appartenez déjà activement à une équipe');
        }
        return this.dataSource.transaction(async (manager) => {
            const team = manager.create(team_entity_1.Team, {
                name: dto.name,
                tag: dto.tag.toUpperCase(),
                captainUserId,
            });
            const savedTeam = await manager.save(team);
            const captainMember = manager.create(team_member_entity_1.TeamMember, {
                teamId: savedTeam.id,
                userId: captainUserId,
                role: enums_1.LolRole.FLEX,
                isSubstitute: false,
                status: enums_1.MemberStatus.ACTIVE,
            });
            await manager.save(captainMember);
            return savedTeam;
        });
    }
    async update(id, requesterUserId, dto) {
        const team = await this.findById(id);
        this.assertIsCaptain(team, requesterUserId);
        if (dto.name !== undefined)
            team.name = dto.name;
        if (dto.tag !== undefined)
            team.tag = dto.tag.toUpperCase();
        return this.teamRepo.save(team);
    }
    async remove(id, requesterUserId) {
        const team = await this.findById(id);
        this.assertIsCaptain(team, requesterUserId);
        await this.teamRepo.remove(team);
    }
    async countActiveStarters(teamId) {
        return this.memberRepo.count({
            where: {
                teamId,
                status: enums_1.MemberStatus.ACTIVE,
                isSubstitute: false,
            },
        });
    }
    assertIsCaptain(team, requesterUserId) {
        if (team.captainUserId !== requesterUserId) {
            throw new common_1.ForbiddenException('Seul le capitaine peut effectuer cette action');
        }
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(team_entity_1.Team)),
    __param(1, (0, typeorm_1.InjectRepository)(team_member_entity_1.TeamMember)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], TeamsService);
//# sourceMappingURL=teams.service.js.map