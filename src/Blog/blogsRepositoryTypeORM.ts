import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './Blog.Entity';
import { Repository } from 'typeorm';
import { PostEntity } from '../Post/Post.Entity';
import { Blog } from './Blog';
import { BlogPaginationDTO, CreateBlogDTO, outputModel } from '../DTO';
import { helper } from '../helper';
import { mapObject } from '../mapObject';

@Injectable()
export class BlogsRepositoryTypeORM {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepositoryTypeOrm: Repository<BlogEntity>,
  ) {}
  async createBlog(newBlog: Blog) {
    const queryInsertBlogEntity = await this.blogRepositoryTypeOrm.save({
      id: newBlog.id,
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
      isMembership: newBlog.isMembership,
    });
    return;
  }
  getFilterBlog(paginationBlog: BlogPaginationDTO): any | null {
    const searchNameTermFilter =
      paginationBlog.searchNameTerm != null
        ? {
            where: 'b.name ilike :searchNameTerm',
            params: { searchNameTerm: `%%${paginationBlog.searchNameTerm}%` },
          }
        : {
            where: '',
            params: '',
          };
    return searchNameTermFilter;
  }
  async getBlogs(
    paginationBlog: BlogPaginationDTO,
    filter: any | null,
  ): Promise<outputModel<Blog>> {
    const qbBlog = await this.blogRepositoryTypeOrm.createQueryBuilder('b');
    const totalCountBlog = await qbBlog
      .where(filter.where, filter.params)
      .getCount();
    console.log(totalCountBlog);
    const sortDirection = paginationBlog.sortDirection === 1 ? 'ASC' : 'DESC';
    const paginationFromHelperForBlogs =
      helper.getPaginationFunctionSkipSortTotal(
        paginationBlog.pageNumber,
        paginationBlog.pageSize,
        totalCountBlog,
      );
    console.log(paginationBlog);

    const zaprosQb = await qbBlog
      .where(filter.where, filter.params)
      .orderBy('b.' + paginationBlog.sortBy, sortDirection)
      .take(paginationBlog.pageSize)
      .skip(paginationFromHelperForBlogs.skipPage)
      .getRawMany();
    console.log('after');
    console.log(zaprosQb);

    const blogs = mapObject.mapRawManyQBOnTableName(zaprosQb, ['b' + '_']);

    const resultBlogs = await Promise.all(
      blogs.map(async (blog: Blog) => {
        const blogView = await mapObject.mapBlogForViewModel(blog);
        return blogView;
      }),
    );
    //console.log(resultBlogs);
    return {
      pagesCount: paginationFromHelperForBlogs.totalCount,
      page: paginationBlog.pageNumber,
      pageSize: paginationBlog.pageSize,
      totalCount: totalCountBlog,
      items: resultBlogs,
    };
  }
  async getBlog(blogId: string): Promise<Blog | false> {
    const qbBlog = await this.blogRepositoryTypeOrm.createQueryBuilder('b');

    const take = await qbBlog.where('id = :id', { id: blogId }).getRawMany();

    if (take.length < 1) {
      return false;
    }
    const blogs = mapObject.mapRawManyQBOnTableName(take, ['b' + '_']);
    return blogs[0];
  }
  async updateBlog(blogId: string, updateBlogDto: CreateBlogDTO) {
    const qbBlog = await this.blogRepositoryTypeOrm.createQueryBuilder('b');

    const update = await qbBlog
      .update(BlogEntity)
      .set({
        name: updateBlogDto.name,
        description: updateBlogDto.description,
        websiteUrl: updateBlogDto.websiteUrl,
      })
      .where('id = :id', { id: blogId })
      .execute();

    if (!update.affected) {
      return false;
    }
    return true;
  }
  async deleteBlog(blogId: string) {
    const qbBlog = await this.blogRepositoryTypeOrm.createQueryBuilder('b');

    const deleteOperation = await qbBlog
      .delete()
      .where('id = :id', { id: blogId })
      .execute();
    if (deleteOperation.affected !== 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return true;
  }
}
