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
exports.PlayerProfilesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const create_player_profile_dto_1 = require("./dto/create-player-profile.dto");
const update_player_profile_dto_1 = require("./dto/update-player-profile.dto");
const player_profiles_service_1 = require("./player-profiles.service");
let PlayerProfilesController = class PlayerProfilesController {
    profilesService;
    constructor(profilesService) {
        this.profilesService = profilesService;
    }
    findAll() {
        return this.profilesService.findAll();
    }
    me(user) {
        return this.profilesService.findByUserId(user.userId);
    }
    findByUser(userId) {
        return this.profilesService.findByUserId(userId);
    }
    create(user, dto) {
        return this.profilesService.create(user.userId, dto);
    }
    update(user, dto) {
        return this.profilesService.update(user.userId, dto);
    }
    remove(user) {
        return this.profilesService.remove(user.userId);
    }
};
exports.PlayerProfilesController = PlayerProfilesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlayerProfilesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.PLAYER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlayerProfilesController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('by-user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlayerProfilesController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.PLAYER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_player_profile_dto_1.CreatePlayerProfileDto]),
    __metadata("design:returntype", void 0)
], PlayerProfilesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.PLAYER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_player_profile_dto_1.UpdatePlayerProfileDto]),
    __metadata("design:returntype", void 0)
], PlayerProfilesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.PLAYER),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlayerProfilesController.prototype, "remove", null);
exports.PlayerProfilesController = PlayerProfilesController = __decorate([
    (0, swagger_1.ApiTags)('player-profiles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('player-profiles'),
    __metadata("design:paramtypes", [player_profiles_service_1.PlayerProfilesService])
], PlayerProfilesController);
//# sourceMappingURL=player-profiles.controller.js.map