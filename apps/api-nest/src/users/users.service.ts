import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('No user found with that ID');
    return user;
  }

  async updateMe(
    id: string,
    data: { name?: string; email?: string; photo?: string },
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
    if (!user) throw new NotFoundException('No user found with that ID');
    return user;
  }

  async deactivate(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { active: false }).exec();
  }

  // Admin update — never allow password changes through this route.
  async update(id: string, data: Record<string, unknown>): Promise<UserDocument> {
    if (data.password) {
      throw new BadRequestException(
        'This route is not for password updates. Use /updateMyPassword.',
      );
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
    if (!user) throw new NotFoundException('No user found with that ID');
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) throw new NotFoundException('No user found with that ID');
  }
}
