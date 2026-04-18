"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const configuration_1 = __importDefault(require("./config/configuration"));
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const user_entity_1 = require("./entities/user.entity");
const player_profile_entity_1 = require("./entities/player-profile.entity");
const team_entity_1 = require("./entities/team.entity");
const team_member_entity_1 = require("./entities/team-member.entity");
const tournament_entity_1 = require("./entities/tournament.entity");
const tournament_registration_entity_1 = require("./entities/tournament-registration.entity");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const player_profiles_module_1 = require("./modules/player-profiles/player-profiles.module");
const teams_module_1 = require("./modules/teams/teams.module");
const team_members_module_1 = require("./modules/team-members/team-members.module");
const tournaments_module_1 = require("./modules/tournaments/tournaments.module");
const registrations_module_1 = require("./modules/registrations/registrations.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('db.host'),
                    port: config.get('db.port'),
                    username: config.get('db.user'),
                    password: config.get('db.password'),
                    database: config.get('db.name'),
                    entities: [
                        user_entity_1.User,
                        player_profile_entity_1.PlayerProfile,
                        team_entity_1.Team,
                        team_member_entity_1.TeamMember,
                        tournament_entity_1.Tournament,
                        tournament_registration_entity_1.TournamentRegistration,
                    ],
                    synchronize: config.get('db.synchronize'),
                    logging: config.get('db.logging'),
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            player_profiles_module_1.PlayerProfilesModule,
            teams_module_1.TeamsModule,
            team_members_module_1.TeamMembersModule,
            tournaments_module_1.TournamentsModule,
            registrations_module_1.RegistrationsModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map