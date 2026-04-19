import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

interface PgError {
  code?: string;
  detail?: string;
  message?: string;
}

interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ url: string; method: string }>();

    const body = this.buildBody(exception, request.url);

    if (body.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${body.statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} → ${body.statusCode}: ${JSON.stringify(body.message)}`,
      );
    }

    response.status(body.statusCode).json(body);
  }

  private buildBody(exception: unknown, path: string): ApiError {
    const timestamp = new Date().toISOString();

    // NestJS HttpException (includes class-validator ValidationException)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : ((res as { message?: string | string[] }).message ?? exception.message);
      return {
        statusCode: status,
        error:
          typeof res === 'object'
            ? ((res as { error?: string }).error ?? HttpStatus[status])
            : HttpStatus[status],
        message,
        timestamp,
        path,
      };
    }

    // TypeORM QueryFailedError — map PostgreSQL error codes
    if (exception instanceof QueryFailedError) {
      const pg = exception.driverError as PgError;
      const code = pg?.code;

      if (code === '23505') {
        return {
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message:
            this.extractUniqueViolationMessage(pg?.detail) ??
            'A resource with these values already exists',
          timestamp,
          path,
        };
      }
      if (code === '23503') {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Referenced resource does not exist',
          timestamp,
          path,
        };
      }
      if (code === '23514') {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Data violates a validation rule (check constraint)',
          timestamp,
          path,
        };
      }
      // Custom RAISE EXCEPTION from triggers
      if (code === 'P0001') {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: pg?.message ?? 'Business rule violation',
          timestamp,
          path,
        };
      }
    }

    // Unknown — hide details from client
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      timestamp,
      path,
    };
  }

  private extractUniqueViolationMessage(detail: string | undefined): string | null {
    if (!detail) return null;
    // detail format: "Key (column)=(value) already exists."
    const match = /Key \(([^)]+)\)=\(([^)]+)\) already exists/.exec(detail);
    if (!match) return null;
    return `${match[1]} "${match[2]}" already exists`;
  }
}
