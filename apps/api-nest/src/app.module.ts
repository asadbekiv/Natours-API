import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ToursModule } from './tours/tours.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting: 100 requests / minute per IP.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('DATABASE'),
        serverSelectionTimeoutMS: 10000,
      }),
    }),
    // AuthModule before UsersModule: the /users auth routes (signup, login,
    // updateMyPassword, ...) must register before UsersController's ':id'.
    AuthModule,
    UsersModule,
    ToursModule,
    ReviewsModule,
    BookingsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
