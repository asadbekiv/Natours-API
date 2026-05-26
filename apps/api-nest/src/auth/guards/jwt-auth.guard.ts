import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Replaces the Express `protect` middleware. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
