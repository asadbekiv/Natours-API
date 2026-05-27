import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({ _id: false })
export class GeoLocation {
  @Prop({ type: String, default: 'Point', enum: ['Point'] })
  type: string;

  /** [longitude, latitude] */
  @Prop({ type: [Number] })
  coordinates: number[];

  @Prop()
  address?: string;

  @Prop()
  description?: string;

  @Prop()
  day?: number;
}
const GeoLocationSchema = SchemaFactory.createForClass(GeoLocation);

export type TourDocument = HydratedDocument<Tour>;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Tour {
  @Prop({
    required: [true, 'Tours must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name must be 40 characters or less'],
    minlength: [10, 'A tour name must be at least 10 characters'],
  })
  name: string;

  @Prop()
  slug?: string;

  @Prop({ type: Number })
  price?: number;

  @Prop({ required: [true, 'Must have a duration'] })
  duration: number;

  @Prop({ required: [true, 'Must have a group size'] })
  maxGroupSize: number;

  @Prop({
    required: [true, 'Must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium or difficult',
    },
  })
  difficulty: string;

  @Prop({
    default: 4.5,
    min: [1, 'Rating must be at least 1.0'],
    max: [5, 'Rating must be 5.0 or below'],
    set: (val: number) => Math.round(val * 10) / 10,
  })
  ratingsAverage: number;

  @Prop({ default: 0 })
  ratingsQuantity: number;

  @Prop({
    type: Number,
    validate: {
      // `this` is the document only on create()/save().
      validator: function (this: Tour, val: number): boolean {
        return val < (this.price ?? Number.POSITIVE_INFINITY);
      },
      message: 'Discount price ({VALUE}) should be below the regular price',
    },
  })
  priceDiscount?: number;

  @Prop({ required: [true, 'Tour must have a summary'], trim: true })
  summary: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: [true, 'Tour must have a cover image'] })
  imageCover: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ default: () => Date.now(), select: false })
  createdAt: Date;

  @Prop({ default: false })
  secretTour: boolean;

  @Prop({ type: GeoLocationSchema })
  startLocation?: GeoLocation;

  @Prop({ type: [GeoLocationSchema] })
  locations: GeoLocation[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  guides: Types.ObjectId[];

  @Prop({ type: [Date] })
  startDates: Date[];
}

export const TourSchema = SchemaFactory.createForClass(Tour);

TourSchema.index({ price: 1, ratingsAverage: -1 });
TourSchema.index({ slug: 1 });
TourSchema.index({ startLocation: '2dsphere' });

TourSchema.virtual('durationWeeks').get(function (this: Tour) {
  return this.duration / 7;
});

// Virtual populate (resolves once the Review model is registered).
TourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

TourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Hide secret tours from all find queries.
TourSchema.pre(/^find/, function (this: { find: (q: object) => unknown }, next) {
  this.find({ secretTour: { $ne: true } });
  (next as () => void)();
});
