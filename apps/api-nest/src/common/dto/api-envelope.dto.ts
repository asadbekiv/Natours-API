import { ApiProperty } from '@nestjs/swagger';

/**
 * Swagger model for the standardized success envelope. The `data` slot is
 * filled in per endpoint by the {@link ApiSuccessResponse} decorator.
 */
export class SuccessEnvelopeDto {
  @ApiProperty({ enum: ['success'], example: 'success' })
  status: 'success';

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Present only on collection endpoints.',
  })
  results?: number;
}

export class ErrorEnvelopeDto {
  @ApiProperty({ enum: ['fail', 'error'], example: 'fail' })
  status: 'fail' | 'error';

  @ApiProperty({ example: 'No tour found with that ID' })
  message: string;
}
