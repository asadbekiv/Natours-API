import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import type { AuthResponse, User as UserContract } from '@natours/shared';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  private buildAuthResponse(user: UserDocument): AuthResponse {
    const token = this.jwtService.sign({ sub: user.id });
    // Strip sensitive fields before returning.
    user.password = undefined as unknown as string;
    return {
      status: 'success',
      token,
      data: { user: user as unknown as UserContract },
    };
  }

  async signup(dto: SignupDto): Promise<AuthResponse> {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });
    // TODO: send welcome email once the mailer is ported.
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+password')
      .exec();
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Incorrect email or password');
    }
    return this.buildAuthResponse(user);
  }

  async forgotPassword(
    email: string,
    resetUrlBase: string,
  ): Promise<{ status: 'success'; message: string }> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('There is no user with that email address');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // TODO: email the link. Until the mailer is ported, log it for dev use.
    // eslint-disable-next-line no-console
    console.log(`Password reset URL: ${resetUrlBase}/${resetToken}`);

    return { status: 'success', message: 'Token sent to email!' };
  }

  async resetPassword(
    token: string,
    dto: ResetPasswordDto,
  ): Promise<AuthResponse> {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userModel
      .findOne({
        passwordResetToken: hashed,
        passwordResetExpires: { $gt: Date.now() },
      })
      .select('+password')
      .exec();
    if (!user) {
      throw new BadRequestException('Token is invalid or has expired');
    }

    user.password = dto.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return this.buildAuthResponse(user);
  }

  async updatePassword(
    userId: string,
    dto: UpdatePasswordDto,
  ): Promise<AuthResponse> {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }
    const user = await this.userModel
      .findById(userId)
      .select('+password')
      .exec();
    if (!user || !(await bcrypt.compare(dto.passwordCurrent, user.password))) {
      throw new UnauthorizedException('Your current password is wrong');
    }
    user.password = dto.password;
    await user.save();
    return this.buildAuthResponse(user);
  }
}
