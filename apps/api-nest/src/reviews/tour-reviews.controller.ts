import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

// Nested routes: /tours/:tourId/reviews (mirrors the Express mergeParams setup).
@ApiTags('reviews')
@ApiBearerAuth()
@Controller('tours/:tourId/reviews')
@UseGuards(JwtAuthGuard)
export class TourReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(@Param('tourId') tourId: string) {
    return this.reviewsService.findAll(tourId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('user')
  create(
    @Param('tourId') tourId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.reviewsService.create(dto, user.id, tourId);
  }
}
