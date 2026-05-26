import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { TourDifficulty } from '@natours/shared';

export class CreateTourDto {
  @IsString()
  @MinLength(10)
  @MaxLength(40)
  name: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsInt()
  @Min(1)
  maxGroupSize: number;

  @IsEnum(['easy', 'medium', 'difficult'])
  difficulty: TourDifficulty;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceDiscount?: number;

  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  imageCover: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  startDates?: string[];
}
