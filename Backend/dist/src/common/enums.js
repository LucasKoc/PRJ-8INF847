"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationStatus = exports.TournamentStatus = exports.MemberStatus = exports.LolRole = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["PLAYER"] = "PLAYER";
    UserRole["TO"] = "TO";
})(UserRole || (exports.UserRole = UserRole = {}));
var LolRole;
(function (LolRole) {
    LolRole["TOP"] = "TOP";
    LolRole["JUNGLE"] = "JUNGLE";
    LolRole["MID"] = "MID";
    LolRole["ADC"] = "ADC";
    LolRole["SUPPORT"] = "SUPPORT";
    LolRole["FLEX"] = "FLEX";
})(LolRole || (exports.LolRole = LolRole = {}));
var MemberStatus;
(function (MemberStatus) {
    MemberStatus["ACTIVE"] = "ACTIVE";
    MemberStatus["LEFT"] = "LEFT";
    MemberStatus["REMOVED"] = "REMOVED";
})(MemberStatus || (exports.MemberStatus = MemberStatus = {}));
var TournamentStatus;
(function (TournamentStatus) {
    TournamentStatus["DRAFT"] = "DRAFT";
    TournamentStatus["OPEN"] = "OPEN";
    TournamentStatus["CLOSED"] = "CLOSED";
    TournamentStatus["CANCELLED"] = "CANCELLED";
    TournamentStatus["COMPLETED"] = "COMPLETED";
})(TournamentStatus || (exports.TournamentStatus = TournamentStatus = {}));
var RegistrationStatus;
(function (RegistrationStatus) {
    RegistrationStatus["PENDING"] = "PENDING";
    RegistrationStatus["APPROVED"] = "APPROVED";
    RegistrationStatus["REJECTED"] = "REJECTED";
    RegistrationStatus["CANCELLED"] = "CANCELLED";
})(RegistrationStatus || (exports.RegistrationStatus = RegistrationStatus = {}));
//# sourceMappingURL=enums.js.map