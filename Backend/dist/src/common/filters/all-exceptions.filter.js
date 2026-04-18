"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'InternalServerError';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            message = typeof res === 'string' ? res : res.message ?? res;
            error = exception.name;
        }
        else if (exception instanceof typeorm_1.QueryFailedError) {
            const pgError = exception;
            switch (pgError.code) {
                case '23505':
                    status = common_1.HttpStatus.CONFLICT;
                    message = pgError.detail ?? 'Contrainte d\'unicité violée';
                    error = 'UniqueViolation';
                    break;
                case '23503':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = pgError.detail ?? 'Référence inexistante';
                    error = 'ForeignKeyViolation';
                    break;
                case '23514':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = `Contrainte violée : ${pgError.constraint ?? 'inconnue'}`;
                    error = 'CheckViolation';
                    break;
                case 'P0001':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = exception.message.replace(/^.*?:\s*/, '');
                    error = 'BusinessRuleViolation';
                    break;
                default:
                    status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                    message = 'Erreur base de données';
                    error = 'DatabaseError';
            }
        }
        this.logger.error(`${request.method} ${request.url} -> ${status} : ${JSON.stringify(message)}`, exception instanceof Error ? exception.stack : undefined);
        response.status(status).json({
            statusCode: status,
            error,
            message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map