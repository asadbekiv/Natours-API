import { IsEmail, IsOptional, IsString } from 'class-validator';

// Only name/email are accepted here. The global ValidationPipe
// (forbidNonWhitelisted) rejects password fields, replacing the old
// "use /updateMyPassword" guard.
export class UpdateMeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
