import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './Blog.Entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsRepositoryTypeORM {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepositoryTypeOrm: Repository<BlogEntity>,
  ) {}
}
