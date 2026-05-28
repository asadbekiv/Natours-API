import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Uploads buffers to Cloudinary and returns the secure URL.
 * Cloudinary handles storage + on-the-fly resize/optimize + CDN delivery.
 */
@Injectable()
export class StorageService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  async uploadImage(
    buffer: Buffer,
    folder: string,
    publicId?: string,
  ): Promise<string> {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          overwrite: true,
        },
        (err, res) => {
          if (err || !res) {
            reject(err ?? new Error('Cloudinary upload failed'));
            return;
          }
          resolve(res);
        },
      );
      Readable.from(buffer).pipe(stream);
    }).catch((err: Error) => {
      throw new InternalServerErrorException(
        `Image upload failed: ${err.message}`,
      );
    });

    return result.secure_url;
  }
}
