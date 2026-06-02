import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Tour, TourDocument } from '../tours/schemas/tour.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Tour.name) private readonly tourModel: Model<TourDocument>,
  ) {}

  findAll(tourId?: string): Promise<Review[]> {
    return this.reviewModel.find(tourId ? { tour: tourId } : {}).exec();
  }

  /** Reviews authored by the current user, newest first. */
  findByUser(userId: string): Promise<Review[]> {
    return this.reviewModel.find({ user: userId }).sort('-createdAt').exec();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('No review found with that ID');
    return review;
  }

  async create(
    dto: CreateReviewDto,
    userId: string,
    tourId: string,
  ): Promise<Review> {
    // Cast explicitly so the BSON is a real ObjectId (Mongoose's auto-cast
    // does this too, but the intent shouldn't depend on a default).
    const review = await this.reviewModel.create({
      review: dto.review,
      rating: dto.rating,
      tour: new Types.ObjectId(tourId),
      user: new Types.ObjectId(userId),
    });
    await this.recalcTourRatings(review.tour);
    return review;
  }

  async update(
    id: string,
    dto: UpdateReviewDto,
    userId: string,
    role: string,
  ): Promise<Review> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('No review found with that ID');
    this.assertOwnerOrAdmin(review, userId, role);
    review.set(dto);
    await review.save();
    await this.recalcTourRatings(review.tour);
    return review;
  }

  async remove(id: string, userId: string, role: string): Promise<void> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('No review found with that ID');
    this.assertOwnerOrAdmin(review, userId, role);
    await review.deleteOne();
    await this.recalcTourRatings(review.tour);
  }

  // Owners may edit their own review; admins may edit any. (The Express
  // version only checked the role, not ownership — tightened here.)
  private assertOwnerOrAdmin(
    review: ReviewDocument,
    userId: string,
    role: string,
  ): void {
    if (role !== 'admin' && review.user.toString() !== userId) {
      throw new ForbiddenException('You can only modify your own reviews');
    }
  }

  // Recompute the parent tour's ratingsAverage / ratingsQuantity.
  private async recalcTourRatings(tourId: Types.ObjectId): Promise<void> {
    const stats = await this.reviewModel.aggregate<{
      _id: Types.ObjectId;
      nRating: number;
      avgRating: number;
    }>([
      { $match: { tour: tourId } },
      {
        $group: {
          _id: '$tour',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    if (stats.length > 0) {
      await this.tourModel.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating,
      });
    } else {
      await this.tourModel.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5,
      });
    }
  }
}
