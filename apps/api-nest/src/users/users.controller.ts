import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { StorageService } from '../storage/storage.service';
import { imageUploadOptions } from '../storage/multer-options';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from './schemas/user.schema';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard) // every user route requires authentication
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  // --- current user ("me") routes; declared before ':id' ---
  @Get('me')
  getMe(@CurrentUser() user: UserDocument) {
    return this.usersService.findById(user.id);
  }

  @Patch('updateMe')
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  async updateMe(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateMeDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    const updates: { name?: string; email?: string; photo?: string } = {
      ...dto,
    };
    if (photo) {
      updates.photo = await this.storageService.uploadImage(
        photo.buffer,
        'natours/users',
        `user-${user.id}`,
        { width: 500, height: 500, fit: 'cover' },
      );
    }
    return this.usersService.updateMe(user.id, updates);
  }

  @Delete('deleteMe')
  @HttpCode(204)
  deleteMe(@CurrentUser() user: UserDocument) {
    return this.usersService.deactivate(user.id);
  }

  // --- admin-only management routes ---
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
