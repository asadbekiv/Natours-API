import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Review {
  @Prop({ required: [true, 'Review can not be empty'], trim: true })
  review: string;

  @Prop({
    required: [true, 'A review must have a rating'],
    min: 1,
    max: 5,
  })
  rating: number;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'Tour', // fixed: the model is registered as 'Tour', not 'Tours'
    required: [true, 'Review must belong to a tour'],
  })
  tour: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user'],
  })
  user: Types.ObjectId;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// One review per user per tour.
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Always include the author's basic info.
ReviewSchema.pre(
  /^find/,
  function (this: { populate: (opt: object) => unknown }, next: () => void) {
    this.populate({ path: 'user', select: 'name photo' });
    next();
  },
);
