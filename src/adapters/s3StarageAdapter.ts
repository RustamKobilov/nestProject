import { S3Client } from '@aws-sdk/client-s3';

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
    export { S3Client };
  }
}
//todo не подкидывает параметры S3Client
