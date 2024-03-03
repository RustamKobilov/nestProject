import { Metadata } from 'sharp';
import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class ImageService {
  // public validateImageForBlog(
  //   metadateImage: Metadata,
  //   imageFormat: string[],
  //   imageSize: number,
  //   imageWidth: number,
  //   imageHeight: number,
  // ) {
  //   console.log(metadateImage);
  //   //const imageFormat = ['png', 'jpeg', 'jpg'];
  //   if (!imageFormat.includes(metadateImage.format as string)) {
  //     console.log('format invalid');
  //     throw new BadRequestException('format invalid');
  //   }
  //   if (metadateImage.size > imageSize) {
  //     console.log('size invalid');
  //     throw new BadRequestException('size invalid');
  //   }
  //   if (
  //     metadateImage.width > imageWidth ||
  //     metadateImage.height > imageHeight
  //   ) {
  //     console.log('width&height invalid');
  //     throw new BadRequestException('width&height invalid');
  //   }
  //   return;
  // }
}
