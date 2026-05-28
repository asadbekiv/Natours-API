import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StorageService } from '../storage/storage.service';
import { imageUploadOptions } from '../storage/multer-options';

@Controller('tours')
export class ToursController {
  constructor(
    private readonly toursService: ToursService,
    private readonly storageService: StorageService,
  ) {}

  // Static/aliased routes must be declared before ':id'.
  @Get('tour-stats')
  getStats() {
    return this.toursService.getStats();
  }

  @Get('monthly-plan/:year')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'lead-guide', 'guide')
  getMonthlyPlan(@Param('year') year: string) {
    return this.toursService.getMonthlyPlan(Number(year));
  }

  @Get('tours-within/:distance/center/:latlng/unit/:unit')
  getToursWithin(
    @Param('distance') distance: string,
    @Param('latlng') latlng: string,
    @Param('unit') unit: string,
  ) {
    const [lat, lng] = latlng.split(',').map(Number);
    return this.toursService.getToursWithin(Number(distance), lat, lng, unit);
  }

  @Get('distances/:latlng/unit/:unit')
  getDistances(@Param('latlng') latlng: string, @Param('unit') unit: string) {
    const [lat, lng] = latlng.split(',').map(Number);
    return this.toursService.getDistances(lat, lng, unit);
  }

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.toursService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toursService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'lead-guide')
  create(@Body() dto: CreateTourDto) {
    return this.toursService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'lead-guide')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageCover', maxCount: 1 },
        { name: 'images', maxCount: 3 },
      ],
      imageUploadOptions,
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTourDto,
    @UploadedFiles()
    files: {
      imageCover?: Express.Multer.File[];
      images?: Express.Multer.File[];
    } = {},
  ) {
    const extra: { imageCover?: string; images?: string[] } = {};
    if (files.imageCover?.[0]) {
      extra.imageCover = await this.storageService.uploadImage(
        files.imageCover[0].buffer,
        'natours/tours',
        `tour-${id}-cover`,
      );
    }
    if (files.images?.length) {
      extra.images = await Promise.all(
        files.images.map((f, i) =>
          this.storageService.uploadImage(
            f.buffer,
            'natours/tours',
            `tour-${id}-${i + 1}`,
          ),
        ),
      );
    }
    return this.toursService.update(id, { ...dto, ...extra });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'lead-guide')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}
