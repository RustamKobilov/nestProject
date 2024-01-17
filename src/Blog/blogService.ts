import { BlogRepository } from './blogRepository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { mapObject } from '../mapObject';
import { BlogViewModel } from '../viewModelDTO';
import { PostService } from '../Post/postService';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepository) {}
}
