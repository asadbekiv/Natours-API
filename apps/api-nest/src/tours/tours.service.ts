import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tour, TourDocument } from './schemas/tour.schema';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

@Injectable()
export class ToursService {
  constructor(
    @InjectModel(Tour.name) private readonly tourModel: Model<TourDocument>,
  ) {}

  async findAll(query: Record<string, unknown>): Promise<Tour[]> {
    // 1) Filtering (with advanced gte/gt/lte/lt operators)
    const queryObj = { ...query };
    ['page', 'sort', 'limit', 'fields'].forEach((f) => delete queryObj[f]);
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    let dbQuery = this.tourModel.find(JSON.parse(queryStr));

    // 2) Sorting
    dbQuery = query.sort
      ? dbQuery.sort(String(query.sort).split(',').join(' '))
      : dbQuery.sort('-createdAt');

    // 3) Field limiting
    dbQuery = query.fields
      ? dbQuery.select(String(query.fields).split(',').join(' '))
      : dbQuery.select('-__v');

    // 4) Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 100;
    dbQuery = dbQuery.skip((page - 1) * limit).limit(limit);

    return dbQuery.exec();
  }

  async findOne(id: string): Promise<Tour> {
    // TODO: re-enable .populate('reviews') once the Review module is ported
    // (the virtual references the not-yet-registered Review model).
    const tour = await this.tourModel.findById(id).exec();
    if (!tour) throw new NotFoundException('No tour found with that ID');
    return tour;
  }

  async create(dto: CreateTourDto): Promise<Tour> {
    return this.tourModel.create(dto);
  }

  async update(id: string, dto: UpdateTourDto): Promise<Tour> {
    const tour = await this.tourModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!tour) throw new NotFoundException('No tour found with that ID');
    return tour;
  }

  async remove(id: string): Promise<void> {
    const tour = await this.tourModel.findByIdAndDelete(id).exec();
    if (!tour) throw new NotFoundException('No tour found with that ID');
  }

  async getStats(): Promise<unknown[]> {
    return this.tourModel.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { avgPrice: 1 } },
    ]);
  }

  async getMonthlyPlan(year: number): Promise<unknown[]> {
    return this.tourModel.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
      { $sort: { numTourStarts: -1 } },
    ]);
  }

  async getToursWithin(
    distance: number,
    lat: number,
    lng: number,
    unit: string,
  ): Promise<Tour[]> {
    if (!lat || !lng) {
      throw new BadRequestException(
        'Please provide latitude,longitude in the format lat,lng',
      );
    }
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    return this.tourModel
      .find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
      })
      .exec();
  }

  async getDistances(
    lat: number,
    lng: number,
    unit: string,
  ): Promise<unknown[]> {
    if (!lat || !lng) {
      throw new BadRequestException(
        'Please provide latitude,longitude in the format lat,lng',
      );
    }
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    return this.tourModel.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
          spherical: true,
        },
      },
      { $project: { distance: 1, name: 1 } },
    ]);
  }
}
