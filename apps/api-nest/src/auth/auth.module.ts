import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Registered here too (independent of UsersModule) so route ordering is
    // controlled purely by AppModule's import order.
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        // expiresIn is typed as number | ms.StringValue (a finicky template
        // union); the value is a runtime string like "90d", so escape the type.
        signOptions: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '90d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
