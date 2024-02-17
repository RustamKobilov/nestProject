import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
@Injectable()
export class S3StorageAdapter {
  client: S3Client;
  constructor() {
    const region = 'us-east-1';
    const endpoint = 'https://storage.yandexcloud.net';
    this.client = new S3Client({
      region: region,
      endpoint: endpoint,
      credentials: {
        secretAccessKey: 'YCPzapN-y0B3_qAuOR5MLtLm1kMzPWUTDTc85gkO',
        accessKeyId: 'YCAJEUxGs6ZF3-0waQ70ddvQC',
      },
    });
  }

  async saveImage(userId: string, originalName: string, buffer: Buffer) {
    const bucketParams = {
      Bucket: 'rustamstorage',
      Key: `/content/users/${userId}/avatars/${userId}.avatar.png`,
      Body: buffer,
      ContentType: 'images/png',
    };
    console.log('try cath start');
    try {
      const upload = await this.client.send(new PutObjectCommand(bucketParams));
      console.log('go to yandexcloud');
      return;
    } catch (e) {
      console.log(e, ' error saveImage');
      return;
    }
  }
}
