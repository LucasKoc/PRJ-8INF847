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
exports.TeamMembersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const add_team_member_dto_1 = require("./dto/add-team-member.dto");
const update_team_member_dto_1 = require("./dto/update-team-member.dto");
const team_members_service_1 = require("./team-members.service");
let TeamMembersController = class TeamMembersController {
    membersService;
    constructor(membersService) {
        this.membersService = membersService;
    }
    list(teamId) {
        return this.membersService.listByTeam(teamId);
    }
    add(teamId, user, dto) {
        return this.membersService.add(teamId, user.userId, dto);
    }
    update(teamId, memberId, user, dto) {
        return this.membersService.update(teamId, memberId, user.userId, dto);
    }
    remove(teamId, memberId, user) {
        return this.membersService.remove(teamId, memberId, user.userId);
    }
};
exports.TeamMembersController = TeamMembersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.PLAYER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, add_team_member_dto_1.AddTeamMemberDto]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "add", null);
__decorate([
    (0, common_1.Patch)(':memberId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.PLAYER),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, update_team_member_dto_1.UpdateTeamMemberDto]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':memberId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.PLAYER),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "remove", null);
exports.TeamMembersController = TeamMembersController = __decorate([
    (0, swagger_1.ApiTags)('team-members'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('teams/:teamId/members'),
    __metadata("design:paramtypes", [team_members_service_1.TeamMembersService])
], TeamMembersController);
//# sourceMappingURL=team-members.controller.js.map