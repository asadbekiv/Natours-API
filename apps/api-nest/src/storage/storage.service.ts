import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';
import sharp from 'sharp';

export interface ResizeOptions {
  width?: number;
  height?: number;
  /** 'cover' crops to exact dimensions (default), 'inside' preserves aspect. */
  fit?: 'cover' | 'inside';
}

/**
 * Resizes images with Sharp and uploads to ImageKit. Returns the public URL.
 *
 * Resizing is mandatory: ImageKit's free tier refuses to serve images above
 * 25 MP, and we don't need huge originals for a tour/avatar app anyway.
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
    resize: ResizeOptions = {},
  ): Promise<string> {
    const width = resize.width ?? 2000;
    const height = resize.height ?? 2000;
    const fit = resize.fit ?? 'inside';

    const processed = await sharp(buffer)
      .resize(width, height, { fit, withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();

    try {
      const fileName = publicId
        ? `${publicId}.jpg`
        : `upload-${Date.now()}.jpg`;
      const result = await this.imagekit.upload({
        file: processed,
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
