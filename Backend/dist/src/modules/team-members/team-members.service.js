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
exports.TeamMembersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const team_member_entity_1 = require("../../entities/team-member.entity");
const team_entity_1 = require("../../entities/team.entity");
const user_entity_1 = require("../../entities/user.entity");
const enums_1 = require("../../common/enums");
const teams_service_1 = require("../teams/teams.service");
let TeamMembersService = class TeamMembersService {
    memberRepo;
    teamRepo;
    userRepo;
    teamsService;
    constructor(memberRepo, teamRepo, userRepo, teamsService) {
        this.memberRepo = memberRepo;
        this.teamRepo = teamRepo;
        this.userRepo = userRepo;
        this.teamsService = teamsService;
    }
    listByTeam(teamId) {
        return this.memberRepo.find({
            where: { teamId },
            relations: { user: true },
            order: { joinedAt: 'ASC' },
        });
    }
    async add(teamId, requesterUserId, dto) {
        const team = await this.teamsService.findById(teamId);
        this.teamsService.assertIsCaptain(team, requesterUserId);
        const newUser = await this.userRepo.findOne({
            where: { id: dto.userId },
        });
        if (!newUser) {
            throw new common_1.NotFoundException(`Utilisateur ${dto.userId} introuvable`);
        }
        if (newUser.role !== enums_1.UserRole.PLAYER) {
            throw new common_1.BadRequestException('Seul un PLAYER peut rejoindre une équipe');
        }
        const activeElsewhere = await this.memberRepo.findOne({
            where: { userId: dto.userId, status: enums_1.MemberStatus.ACTIVE },
        });
        if (activeElsewhere) {
            throw new common_1.BadRequestException(`L'utilisateur ${dto.userId} est déjà actif dans une équipe`);
        }
        const member = this.memberRepo.create({
            teamId,
            userId: dto.userId,
            role: dto.role,
            isSubstitute: dto.isSubstitute ?? false,
            status: enums_1.MemberStatus.ACTIVE,
        });
        return this.memberRepo.save(member);
    }
    async update(teamId, memberId, requesterUserId, dto) {
        const team = await this.teamsService.findById(teamId);
        this.teamsService.assertIsCaptain(team, requesterUserId);
        const member = await this.memberRepo.findOne({
            where: { id: memberId, teamId },
        });
        if (!member) {
            throw new common_1.NotFoundException('Membre introuvable dans cette équipe');
        }
        if (dto.role !== undefined)
            member.role = dto.role;
        if (dto.isSubstitute !== undefined)
            member.isSubstitute = dto.isSubstitute;
        return this.memberRepo.save(member);
    }
    async remove(teamId, memberId, requesterUserId, reason = enums_1.MemberStatus.REMOVED) {
        const team = await this.teamsService.findById(teamId);
        this.teamsService.assertIsCaptain(team, requesterUserId);
        const member = await this.memberRepo.findOne({
            where: { id: memberId, teamId },
        });
        if (!member) {
            throw new common_1.NotFoundException('Membre introuvable dans cette équipe');
        }
        if (member.userId === team.captainUserId) {
            throw new common_1.BadRequestException('Le capitaine ne peut pas être retiré de son équipe');
        }
        member.status = reason;
        member.leftAt = new Date();
        return this.memberRepo.save(member);
    }
};
exports.TeamMembersService = TeamMembersService;
exports.TeamMembersService = TeamMembersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(team_member_entity_1.TeamMember)),
    __param(1, (0, typeorm_1.InjectRepository)(team_entity_1.Team)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        teams_service_1.TeamsService])
], TeamMembersService);
//# sourceMappingURL=team-members.service.js.map