import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ToursModule } from './tours/tours.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
})
export class AppModule {}
