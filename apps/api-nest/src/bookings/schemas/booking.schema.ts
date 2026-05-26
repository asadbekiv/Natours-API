import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

@Schema()
export class Booking {
  @Prop({
    type: Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour'],
  })
  tour: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user'],
  })
  user: Types.ObjectId;

  @Prop({ required: [true, 'Booking must have a price'] })
  price: number;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ default: true })
  paid: boolean;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.pre(
  /^find/,
  function (this: { populate: (opt: object | string) => any }, next: () => void) {
    this.populate('user').populate({ path: 'tour', select: 'name' });
    next();
  },
);
