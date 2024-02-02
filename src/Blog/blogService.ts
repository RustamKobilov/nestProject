import { BlogRepository } from './blogRepository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepository) {}
}
