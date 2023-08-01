import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attempt, AttemptDocument } from './Attempt';

@Injectable()
export class AttemptRepository {
  constructor(
    @InjectModel(Attempt.name) private attemptModel: Model<AttemptDocument>,
  ) {}

  async createAttempt(attempt: Attempt) {
    await this.attemptModel.insertMany({
      endpointName: attempt.endpointName,
      ip: attempt.ip,
      dateAttempt: attempt.dateAttempt,
    });
    return;
  }
  async getCountAttemptIpForEndPoint(attempt: Attempt): Promise<number> {
    const getAttempt = await this.attemptModel.countDocuments({
      endPointName: attempt.endpointName,
      ip: attempt.ip,
      dateAttempt: { $gte: attempt.dateAttempt },
    });
    return getAttempt;
  }
}
