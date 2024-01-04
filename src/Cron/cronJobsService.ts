import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronJobsService {
  @Cron('0 * * * * *')
  openForBusiness() {
    console.log('every min cron...');
  }
}
