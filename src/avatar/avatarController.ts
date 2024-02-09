import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import path, { dirname } from 'node:path';
import { readTextFileAsync } from './utils/fs.utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('/avatar')
export class AvatarController {
  constructor() {}
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
  async putChangeAvatar(
    req: Request,
    res: Response,
    @UploadedFile() avatarFile /*: Express.Multer.File*/,
  ) {
    //const login = req.params.login;
    //const password = req.params.login;
    console.log(avatarFile);
    console.log('reee');
    return 'content';
  }
}
