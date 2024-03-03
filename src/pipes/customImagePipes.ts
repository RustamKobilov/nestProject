import { FileValidator, Injectable } from '@nestjs/common';
import { Express } from 'express';
import sharp from 'sharp';
import { CustomUploadImageValidatorOptionsType } from '../Enum';

@Injectable()
export class CustomUploadFileTypeValidator extends FileValidator<CustomUploadImageValidatorOptionsType> {
  private imageFormat: string[];
  private imageSize: number;
  private imageWidth: number;
  private imageHeight: number;

  constructor(
    protected readonly validationOptions: CustomUploadImageValidatorOptionsType,
  ) {
    super(validationOptions);
    this.imageFormat = this.validationOptions.fileType;
    this.imageSize = this.validationOptions.imageSize;
    this.imageWidth = this.validationOptions.imageWidth;
    this.imageHeight = this.validationOptions.imageHeight;
  }
  public async isValid(file: Express.Multer.File): Promise<boolean> {
    try {
      const stats = await sharp(file.buffer).stats(); //check image file
    } catch (e) {
      console.log(e, 'no images');
      return false;
    }
    const imageValidate = await sharp(file.buffer).toBuffer({
      resolveWithObject: true,
    });

    if (!this.imageFormat.includes(imageValidate.info.format)) {
      console.log('format invalid');
      //throw new BadRequestException('format invalid');
      return false;
    }
    console.log(file.size, this.imageSize);
    if (file.size > this.imageSize) {
      console.log('size invalid');
      //throw new BadRequestException('size invalid');
      return false;
    }
    console.log(imageValidate.info.width, this.imageWidth);
    console.log(imageValidate.info.height, this.imageHeight);
    if (imageValidate.info.width !== this.imageWidth) {
      console.log('width invalid');
      // throw new BadRequestException('width&height invalid');
      return false;
    }

    if (imageValidate.info.height !== this.imageHeight) {
      console.log('height invalid');
      // throw new BadRequestException('width&height invalid');
      return false;
    }
    return true;
  }

  public buildErrorMessage(): string {
    return `Upload not validation`;
  }
}
