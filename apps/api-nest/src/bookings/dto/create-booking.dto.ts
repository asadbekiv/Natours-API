import { IsBoolean, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  tour: string;

  @IsMongoId()
  user: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsBoolean()
  paid?: boolean;
}
