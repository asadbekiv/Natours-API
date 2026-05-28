import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

/**
 * Shared multer options for image uploads (memory buffer → ImageKit).
 *
 * Typed loosely on purpose: @types/multer's `Options.fileFilter` callback
 * (`FileFilterCallback`) doesn't structurally match Nest's `MulterOptions`
 * callback, so an explicit `: Options` annotation breaks one side. Letting
 * TS infer the shape lets both Nest's FileInterceptor and multer at runtime
 * accept it.
 */
export const imageUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (
    _req: unknown,
    file: { mimetype: string },
    cb: (error: Error | null, acceptFile: boolean) => void,
  ): void => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only image files are allowed'), false);
    }
  },
};
