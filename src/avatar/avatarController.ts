import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import path from 'node:path';
import {
  checkAndCreateDirectoryAsyncAsync,
  readTextFileAsync,
  saveFileAsync,
} from './utils/fs.utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { S3StorageAdapter } from '../adapters/s3StarageAdapter';

@Controller('/avatar')
export class AvatarController {
  constructor(private s3Adapter: S3StorageAdapter) {}
  @Get()
  async getChangeAvatar(req: Request, res: Response) {
    const content = await readTextFileAsync(
      path.join('views', 'changePage.html'),
    );
    //console.log(require.main.filename);

    //console.log(pathFinish);
    //console.log(__dirname);
    return content;
  }
  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  async postChangeAvatar(
    req: Request,
    res: Response,
    @UploadedFile() avatarFile: Express.Multer.File,
  ) {
    //const login = req.params.login;
    //const password = req.params.login;
    const userId = '112233';
    const dir = path.join('image', userId);
    //await checkAndCreateDirectoryAsyncAsync(dir);
    //await saveFileAsync(
    // path.join(dir, avatarFile.originalname),
    // avatarFile.buffer,
    //);
    await this.s3Adapter.saveImage(userId, dir, avatarFile.buffer);
    console.log('reee');
    console.log(avatarFile);

    return 'content';
  }
}
