import { Controller, Get } from '@nestjs/common';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { readTextFileAsync } from './utils/fs.utils';

@Controller('/avatar')
export class AvatarController {
  constructor() {}
  @Get()
  async getChangeAvatar() {
    const content = await readTextFileAsync('pathToFile');
    //console.log(require.main.filename);
    return '<h1>Hello change!</h1>';
  }
}
