import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { ImagePurpose } from '../Enum';
import { endpoints } from '../../test/routing';
@Injectable()
export class S3StorageAdapter {
  client: S3Client;
  endpoint: string;
  constructor(private configService: ConfigService) {
    const region = 'us-east-1';
    this.endpoint = configService.get<string>('Yandex_Storage_URL') as string;
    this.client = new S3Client({
      region: region,
      endpoint: this.endpoint,
      credentials: {
        secretAccessKey: configService.get<string>(
          'Yandex_SecretAccessKey',
        ) as string,
        accessKeyId: configService.get<string>('Yandex_AccessKeyId') as string,
      },
    });
  }

  async saveImageForParent(
    nameImage: string,
    typeImage: string,
    userId: string,
    parentId: string,
    buffer: Buffer,
    backetName: string,
    keyImages: string,
    imagePurpose: ImagePurpose,
  ): Promise<string> {
    const bucketParams = {
      Bucket: backetName,
      Key: `${keyImages}/${userId}/${parentId}/${imagePurpose}/${nameImage}`,
      Body: buffer,
      ContentType: `${typeImage}`,
    };

    try {
      const upload: PutObjectCommandOutput = await this.client.send(
        new PutObjectCommand(bucketParams),
      );
      console.log('go to yandexcloud');
      return bucketParams.Key;
    } catch (e) {
      console.log(e, ' error saveImage');
      throw new BadRequestException('saveImage/S3StorageAdapter');
    }
  }
  async getSecretDownloadUrl(
    url: string,
    userId: string,
    parentId: string,
    backetName: string,
  ) {
    const bucketParams = {
      Bucket: backetName,
      Key: url,
      Body: 'Body',
    };

    const command = new GetObjectCommand(bucketParams);
    try {
      const signedUrl = await getSignedUrl(this.client, command, {
        expiresIn: 600,
      });
      return signedUrl;
    } catch (e) {
      console.log(e, ' error getSecretDownloadUrl');
      throw new BadRequestException('getSecretDownloadUrl/S3StorageAdapter');
    }
  }
  async deleteImage(
    userId: string,
    parentId: string,
    backetName: string,
    keyImages: string,
    imagePurpose: ImagePurpose,
    nameImage: string,
  ) {
    const bucketParams = {
      Bucket: backetName,
      Key: `${keyImages}/${userId}/${parentId}/${imagePurpose}/${nameImage}`,
    };
    try {
      const deleteImage: DeleteObjectCommandOutput = await this.client.send(
        new DeleteObjectCommand(bucketParams),
      );
      console.log(deleteImage, 'delete');
      return;
    } catch (e) {
      console.log(e, ' error saveImage');
      return;
    }
  }
}
