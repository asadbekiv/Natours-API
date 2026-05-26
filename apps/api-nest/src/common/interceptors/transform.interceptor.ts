import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { SuccessResponse } from '@natours/shared';

/**
 * Wraps controller return values in the standardized success envelope:
 *   { status: 'success', data }                 (single resource)
 *   { status: 'success', results, data }         (collection)
 * Mirrors the contract defined in @natours/shared.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T> | T> {
    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data) => {
        // 204 No Content: never attach a body.
        if (res.statusCode === 204) return data;

        const body: SuccessResponse<T> = { status: 'success', data };
        if (Array.isArray(data)) body.results = data.length;
        return body;
      }),
    );
  }
}
