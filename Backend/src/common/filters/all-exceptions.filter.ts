import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Traduit les erreurs PostgreSQL (triggers métier + contraintes) en
 * réponses HTTP exploitables côté frontend.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message ?? res;
      error = exception.name;
    } else if (exception instanceof QueryFailedError) {
      const pgError = exception as QueryFailedError & {
        code?: string;
        detail?: string;
        constraint?: string;
      };

      switch (pgError.code) {
        case '23505': // unique_violation
          status = HttpStatus.CONFLICT;
          message = pgError.detail ?? 'Contrainte d\'unicité violée';
          error = 'UniqueViolation';
          break;
        case '23503': // foreign_key_violation
          status = HttpStatus.BAD_REQUEST;
          message = pgError.detail ?? 'Référence inexistante';
          error = 'ForeignKeyViolation';
          break;
        case '23514': // check_violation
          status = HttpStatus.BAD_REQUEST;
          message = `Contrainte violée : ${pgError.constraint ?? 'inconnue'}`;
          error = 'CheckViolation';
          break;
        case 'P0001': // RAISE EXCEPTION (triggers métier)
          status = HttpStatus.BAD_REQUEST;
          message = exception.message.replace(/^.*?:\s*/, '');
          error = 'BusinessRuleViolation';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Erreur base de données';
          error = 'DatabaseError';
      }
    }

    this.logger.error(
      `${request.method} ${request.url} -> ${status} : ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
