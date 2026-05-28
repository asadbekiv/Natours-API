import { BadRequestException } from '@nestjs/common';
import { memoryStorage, type Options } from 'multer';

/** Shared multer options for image uploads (memory buffer → Cloudinary). */
export const imageUploadOptions: Options = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      // Cast: multer's callback types don't include subclasses of Error here.
      cb(new BadRequestException('Only image files are allowed') as unknown as null, false);
    }
  },
};
