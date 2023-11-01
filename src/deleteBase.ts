import { Controller, Delete, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { DataRepository } from './dataRepository';

@Controller('testing/all-data')
export class DeleteBase {
  constructor(private dataRepository: DataRepository) {}
  @Delete()
  async deleteBase(@Res() res: Response) {
    await this.dataRepository.deleteBase();
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
