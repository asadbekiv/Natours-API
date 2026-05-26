import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Tour, TourSchema } from '../tours/schemas/tour.schema';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TourReviewsController } from './tour-reviews.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Tour.name, schema: TourSchema },
    ]),
  ],
  controllers: [ReviewsController, TourReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
