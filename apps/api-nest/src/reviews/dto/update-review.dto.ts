import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsString()
  review?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
