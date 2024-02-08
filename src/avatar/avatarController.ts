import { Controller, Get } from '@nestjs/common';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { readTextFileAsync } from './utils/fs.utils';

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
}
