import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Stripe calls this — no auth guard; uses the raw request body for
  // signature verification (rawBody is enabled in main.ts).
  @Post('webhook-checkout')
  @HttpCode(200)
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.bookingsService.handleWebhook(req.rawBody as Buffer, signature);
  }

  @Get('checkout-session/:tourId')
  @UseGuards(JwtAuthGuard)
  async getCheckoutSession(
    @Param('tourId') tourId: string,
    @CurrentUser() user: UserDocument,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const session = await this.bookingsService.createCheckoutSession(
      tourId,
      user.email,
      baseUrl,
    );
    // Frontend reads res.session.id — keep the shape, interceptor passes it through.
    return { status: 'success', session };
  }

  // Current user's bookings — declared before ':id' so the static path wins.
  @Get('my-tours')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: UserDocument) {
    return this.bookingsService.findByUser(user.id);
  }

  // --- admin / lead-guide management ---
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'lead-guide')
  findAll() {
    return this.bookingsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'lead-guide')
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'lead-guide')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'lead-guide')
  update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'lead-guide')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
