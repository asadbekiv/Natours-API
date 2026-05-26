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
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

// NOTE: write routes here are currently unprotected. Auth guards
// (protect / restrictTo) arrive with the auth + users module port.
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  // Static/aliased routes must be declared before ':id'.
  @Get('tour-stats')
  getStats() {
    return this.toursService.getStats();
  }

  @Get('monthly-plan/:year')
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
  create(@Body() dto: CreateTourDto) {
    return this.toursService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTourDto) {
    return this.toursService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}
