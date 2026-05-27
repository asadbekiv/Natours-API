import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { Tour, TourDocument } from '../tours/schemas/tour.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(
    config: ConfigService,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Tour.name) private readonly tourModel: Model<TourDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    this.stripe = new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY'));
    this.webhookSecret = config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
  }

  async createCheckoutSession(
    tourId: string,
    customerEmail: string,
    baseUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    const tour = await this.tourModel.findById(tourId).exec();
    if (!tour) throw new NotFoundException('No tour found with that ID');

    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${baseUrl}/my-tours?alert=booking`,
      cancel_url: `${baseUrl}/tour/${tour.slug}`,
      customer_email: customerEmail,
      client_reference_id: tourId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: (tour.price ?? 0) * 100,
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            },
          },
        },
      ],
    });
  }

  async handleWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<{ received: boolean }> {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook error: ${(err as Error).message}`);
    }

    if (event.type === 'checkout.session.completed') {
      // Throwing here yields a non-2xx so Stripe retries instead of dropping
      // the booking.
      await this.fulfillCheckout(event.data.object as Stripe.Checkout.Session);
    }
    return { received: true };
  }

  private async fulfillCheckout(session: Stripe.Checkout.Session): Promise<void> {
    const tour = session.client_reference_id;
    const user = await this.userModel
      .findOne({ email: session.customer_email ?? '' })
      .exec();
    if (!tour || !user) {
      throw new Error(`Cannot fulfill checkout for session ${session.id}`);
    }
    const price = (session.amount_total ?? 0) / 100;
    await this.bookingModel.create({ tour, user: user.id, price });
  }

  // --- admin CRUD ---
  findAll(): Promise<Booking[]> {
    return this.bookingModel.find().exec();
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) throw new NotFoundException('No booking found with that ID');
    return booking;
  }

  create(dto: CreateBookingDto): Promise<Booking> {
    return this.bookingModel.create(dto);
  }

  async update(id: string, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!booking) throw new NotFoundException('No booking found with that ID');
    return booking;
  }

  async remove(id: string): Promise<void> {
    const booking = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!booking) throw new NotFoundException('No booking found with that ID');
  }
}
