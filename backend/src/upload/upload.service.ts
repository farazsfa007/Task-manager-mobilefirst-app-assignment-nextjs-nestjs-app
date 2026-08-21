import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFiles(files: Express.Multer.File[]) {
    if (!files.length) return [];

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new BadRequestException('Cloudinary is not configured');
    }

    return Promise.all(files.map((file) => this.uploadBuffer(file)));
  }

  private uploadBuffer(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'task-manager',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            reject(new BadRequestException('File upload failed'));
            return;
          }
          resolve(result.secure_url);
        },
      );

      stream.end(file.buffer);
    });
  }
}
