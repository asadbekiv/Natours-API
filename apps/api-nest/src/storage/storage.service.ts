import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

/**
 * Uploads buffers to ImageKit and returns the public URL.
 * ImageKit handles storage + on-the-fly resize/optimize (via URL params)
 * + CDN delivery.
 */
@Injectable()
export class StorageService {
  private readonly imagekit: ImageKit;

  constructor(config: ConfigService) {
    this.imagekit = new ImageKit({
      publicKey: config.getOrThrow<string>('IMAGEKIT_PUBLIC_KEY'),
      privateKey: config.getOrThrow<string>('IMAGEKIT_PRIVATE_KEY'),
      urlEndpoint: config.getOrThrow<string>('IMAGEKIT_URL_ENDPOINT'),
    });
  }

  async uploadImage(
    buffer: Buffer,
    folder: string,
    publicId?: string,
  ): Promise<string> {
    try {
      // useUniqueFileName=false + overwriteFile=true → "user-<id>" replaces
      // on re-upload instead of accumulating duplicates.
      const fileName = publicId ? `${publicId}.jpg` : `upload-${Date.now()}.jpg`;
      const result = await this.imagekit.upload({
        file: buffer,
        fileName,
        folder: `/${folder}`,
        useUniqueFileName: false,
        overwriteFile: true,
      });
      return result.url;
    } catch (err) {
      throw new InternalServerErrorException(
        `Image upload failed: ${(err as Error).message}`,
      );
    }
  }
}
