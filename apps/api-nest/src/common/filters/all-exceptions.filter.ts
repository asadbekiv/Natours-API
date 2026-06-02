import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import type { ErrorResponse } from '@natours/shared';

/**
 * Produces the standardized error envelope { status, message } and maps the
 * common Mongoose errors to 400s — the equivalent of the old Express
 * error-controller.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went very wrong!';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      const extracted =
        typeof response === 'string'
          ? response
          : (response as { message?: string | string[] }).message ??
            exception.message;
      message = Array.isArray(extracted) ? extracted.join('. ') : extracted;
    } else if (exception instanceof MongooseError.CastError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = `Invalid ${exception.path}: ${String(exception.value)}`;
    } else if (exception instanceof MongooseError.ValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      const details = Object.values(exception.errors)
        .map((e) => e.message)
        .join('. ');
      message = `Invalid input data. ${details}`;
    } else if ((exception as { code?: number })?.code === 11000) {
      statusCode = HttpStatus.BAD_REQUEST;
      const keyValue = (exception as { keyValue?: unknown }).keyValue;
      message = `Duplicate field value: ${JSON.stringify(keyValue)}. Please use another value!`;
    }

    if (statusCode >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponse = {
      status: statusCode >= 500 ? 'error' : 'fail',
      message,
    };
    res.status(statusCode).json(body);
  }
}
