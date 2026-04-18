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
exports.RegistrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const register_team_dto_1 = require("./dto/register-team.dto");
const review_registration_dto_1 = require("./dto/review-registration.dto");
const registrations_service_1 = require("./registrations.service");
let RegistrationsController = class RegistrationsController {
    registrationsService;
    constructor(registrationsService) {
        this.registrationsService = registrationsService;
    }
    list(tournamentId) {
        return this.registrationsService.listByTournament(tournamentId);
    }
    register(tournamentId, user, dto) {
        return this.registrationsService.register(tournamentId, user.userId, dto);
    }
    findOne(id) {
        return this.registrationsService.findById(id);
    }
    review(id, user, dto) {
        return this.registrationsService.review(id, user.userId, dto);
    }
    cancel(id, user) {
        return this.registrationsService.cancel(id, user.userId);
    }
};
exports.RegistrationsController = RegistrationsController;
__decorate([
    (0, common_1.Get)('tournaments/:tournamentId/registrations'),
    __param(0, (0, common_1.Param)('tournamentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('tournaments/:tournamentId/registrations'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.PLAYER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, register_team_dto_1.RegisterTeamDto]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('registrations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('registrations/:id/review'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.TO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, review_registration_dto_1.ReviewRegistrationDto]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "review", null);
__decorate([
    (0, common_1.Delete)('registrations/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.PLAYER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "cancel", null);
exports.RegistrationsController = RegistrationsController = __decorate([
    (0, swagger_1.ApiTags)('registrations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [registrations_service_1.RegistrationsService])
], RegistrationsController);
//# sourceMappingURL=registrations.controller.js.map