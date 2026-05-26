import { IsInt, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  review: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  // Used by the flat POST /reviews route; the nested route takes :tourId.
  @IsOptional()
  @IsMongoId()
  tour?: string;
}
