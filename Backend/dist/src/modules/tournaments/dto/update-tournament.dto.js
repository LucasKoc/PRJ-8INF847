"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTournamentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_tournament_dto_1 = require("./create-tournament.dto");
class UpdateTournamentDto extends (0, swagger_1.PartialType)(create_tournament_dto_1.CreateTournamentDto) {
}
exports.UpdateTournamentDto = UpdateTournamentDto;
//# sourceMappingURL=update-tournament.dto.js.map