import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

// Flat /reviews routes. All require authentication.
@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  // Current user's reviews — declared before ':id' so the static path wins.
  @Get('my-reviews')
  findMine(@CurrentUser() user: UserDocument) {
    return this.reviewsService.findByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('user')
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: UserDocument) {
    if (!dto.tour) {
      throw new BadRequestException('A review must reference a tour');
    }
    return this.reviewsService.create(dto, user.id, dto.tour);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.reviewsService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.reviewsService.remove(id, user.id, user.role);
  }
}
