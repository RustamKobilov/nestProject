import { Injectable } from '@nestjs/common';
import { AttemptRepository } from './attemptRepository';
import { Attempt } from './Attempt';

@Injectable()
export class AttemptService {
  constructor(private attemptRepository: AttemptRepository) {}
  async createAttempt(endpointName: string, ip: string) {
    const checkAttempt: Attempt = {
      endpointName: endpointName,
      ip: ip,
      dateAttempt: new Date(Date.now() + 10000).toISOString(),
    };
    return await this.attemptRepository.createAttempt(checkAttempt);
  }
  async checkAttempt(endpointName: string, ip: string) {
    const checkAttempt: Attempt = {
      endpointName: endpointName,
      ip: ip,
      dateAttempt: new Date(Date.now() + 10000).toISOString(),
    };
    return await this.attemptRepository.getCountAttemptIpForEndPoint(
      checkAttempt,
    );
  }
}
