"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePlayerProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_player_profile_dto_1 = require("./create-player-profile.dto");
class UpdatePlayerProfileDto extends (0, swagger_1.PartialType)(create_player_profile_dto_1.CreatePlayerProfileDto) {
}
exports.UpdatePlayerProfileDto = UpdatePlayerProfileDto;
//# sourceMappingURL=update-player-profile.dto.js.map