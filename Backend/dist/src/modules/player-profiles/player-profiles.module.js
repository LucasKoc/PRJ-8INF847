"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerProfilesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const player_profile_entity_1 = require("../../entities/player-profile.entity");
const user_entity_1 = require("../../entities/user.entity");
const player_profiles_controller_1 = require("./player-profiles.controller");
const player_profiles_service_1 = require("./player-profiles.service");
let PlayerProfilesModule = class PlayerProfilesModule {
};
exports.PlayerProfilesModule = PlayerProfilesModule;
exports.PlayerProfilesModule = PlayerProfilesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([player_profile_entity_1.PlayerProfile, user_entity_1.User])],
        controllers: [player_profiles_controller_1.PlayerProfilesController],
        providers: [player_profiles_service_1.PlayerProfilesService],
        exports: [player_profiles_service_1.PlayerProfilesService],
    })
], PlayerProfilesModule);
//# sourceMappingURL=player-profiles.module.js.map