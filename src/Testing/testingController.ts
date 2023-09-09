import { Controller, Delete, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { RepositoryTesting } from './repositoryTesting';

@Controller('testing/all-data')
export class TestingController {
  constructor(private readonly repositoryTesting: RepositoryTesting) {}
  @Delete()
  async deleteBase(@Res() res: Response) {
    await this.repositoryTesting.deleteAll();
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
