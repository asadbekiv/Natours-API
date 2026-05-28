import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { SuccessEnvelopeDto } from '../dto/api-envelope.dto';

interface Options {
  status?: number;
  isArray?: boolean;
  description?: string;
}

/**
 * Documents an endpoint response in the standardized envelope:
 *   { status: 'success', results?, data: <model> }
 * `data` is wrapped as either the model or an array of it.
 */
export const ApiSuccessResponse = <TModel extends Type<unknown>>(
  model: TModel,
  opts: Options = {},
) =>
  applyDecorators(
    ApiExtraModels(SuccessEnvelopeDto, model),
    ApiResponse({
      status: opts.status ?? 200,
      description: opts.description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessEnvelopeDto) },
          {
            properties: {
              data: opts.isArray
                ? { type: 'array', items: { $ref: getSchemaPath(model) } }
                : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
