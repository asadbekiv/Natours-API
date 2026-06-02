import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  passwordCurrent: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  passwordConfirm: string;
}
