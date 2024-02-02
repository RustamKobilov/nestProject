import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './Blog.Entity';
import { Repository } from 'typeorm';
import { Blog } from './Blog';
import { BlogPaginationDTO, CreateBlogDTO, outputModel } from '../DTO';
import { helper } from '../helper';
import { mapObject } from '../mapObject';
import { BlogViewModel, SaBlogViewModel } from '../viewModelDTO';

@Injectable()
export class BlogsRepositoryTypeORM {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepositoryTypeOrm: Repository<BlogEntity>,
  ) {}
  async createBlog(newBlog: Blog) {
    const queryInsertBlogEntity = await this.blogRepositoryTypeOrm.save(<
      BlogEntity
    >{
      id: newBlog.id,
      userId: newBlog.userId,
      userLogin: newBlog.userLogin,
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
      isMembership: newBlog.isMembership,
      vision: true,
    });
    return;
  }
  getSearchNameTermFilterBlog(paginationBlog: BlogPaginationDTO): any | null {
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
  async getBlogsForBlogger(
    paginationBlog: BlogPaginationDTO,
    searchNameTermFilter: any | null,
    userId: string,
  ): Promise<outputModel<BlogViewModel>> {
    const filter = searchNameTermFilter;
    if (searchNameTermFilter.where === '') {
      filter.where = 'b.userId = :userId';
      filter.params = { userId: userId };
    } else {
      filter.where = filter.where + ' AND b.userId =:userId';
      filter.params = { ...filter.params, userId: userId };
    }
    const qbBlog = await this.blogRepositoryTypeOrm.createQueryBuilder('b');
    console.log(filter);
    const totalCountBlog = await qbBlog
      .where(filter.where, filter.params)
      .andWhere('b.vision = :vision', { vision: true })
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
      .andWhere('b.vision = :vision', { vision: true })
      .orderBy('b.' + paginationBlog.sortBy, sortDirection)
      .limit(paginationBlog.pageSize)
      .offset(paginationFromHelperForBlogs.skipPage)
      .getRawMany();

    const blogs = mapObject.mapRawManyQBOnTableNameIsNotNull(zaprosQb, [
      'b' + '_',
    ]);

    const resultBlogs = await Promise.all(
      blogs.map(async (blog: Blog) => {
        const blogView = await mapObject.mapBlogForViewModel(blog);
        return blogView;
      }),
    );
    return {
      pagesCount: paginationFromHelperForBlogs.totalCount,
      page: paginationBlog.pageNumber,
      pageSize: paginationBlog.pageSize,
      totalCount: totalCountBlog,
      items: resultBlogs,
    };
  }
  async getBlogsForSa(
    paginationBlog: BlogPaginationDTO,
    searchNameTermFilter,
  ): Promise<outputModel<SaBlogViewModel>> {
    const qbBlog = await this.blogRepositoryTypeOrm.createQueryBuilder('b');
    const totalCountBlog = await qbBlog
      .where(searchNameTermFilter.where, searchNameTermFilter.params)
      .andWhere('b.vision = :vision', { vision: true })
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
      .where(searchNameTermFilter.where, searchNameTermFilter.params)
      .andWhere('b.vision = :vision', { vision: true })
      .orderBy('b.' + paginationBlog.sortBy, sortDirection)
      .limit(paginationBlog.pageSize)
      .offset(paginationFromHelperForBlogs.skipPage)
      .getRawMany();
    console.log('after');
    console.log(zaprosQb);

    const blogs = mapObject.mapRawManyQBOnTableNameIsNotNull(zaprosQb, [
      'b' + '_',
    ]);

    const resultBlogs = await Promise.all(
      blogs.map(async (blog: Blog) => {
        const saBlogView = await mapObject.mapSaBlogForViewModel(blog);
        return saBlogView;
      }),
    );
    return {
      pagesCount: paginationFromHelperForBlogs.totalCount,
      page: paginationBlog.pageNumber,
      pageSize: paginationBlog.pageSize,
      totalCount: totalCountBlog,
      items: resultBlogs,
    };
  }
  async getBlogs(
    paginationBlog: BlogPaginationDTO,
    searchNameTermFilter,
  ): Promise<outputModel<SaBlogViewModel>> {
    const qbBlog = await this.blogRepositoryTypeOrm.createQueryBuilder('b');
    const totalCountBlog = await qbBlog
      .where(searchNameTermFilter.where, searchNameTermFilter.params)
      .andWhere('b.vision = :vision', { vision: true })
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
      .where(searchNameTermFilter.where, searchNameTermFilter.params)
      .andWhere('b.vision = :vision', { vision: true })
      .orderBy('b.' + paginationBlog.sortBy, sortDirection)
      .limit(paginationBlog.pageSize)
      .offset(paginationFromHelperForBlogs.skipPage)
      .getRawMany();
    console.log('after');
    console.log(zaprosQb);

    const blogs = mapObject.mapRawManyQBOnTableNameIsNotNull(zaprosQb, [
      'b' + '_',
    ]);

    const resultBlogs = await Promise.all(
      blogs.map(async (blog: Blog) => {
        const blogView = await mapObject.mapBlogForViewModel(blog);
        return blogView;
      }),
    );
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

    const take = await qbBlog
      .where('id = :id', { id: blogId })
      .andWhere('b.vision = :vision', { vision: true })
      .getRawMany();

    if (take.length < 1) {
      return false;
    }
    const blogs = mapObject.mapRawManyQBOnTableNameIsNotNull(take, ['b' + '_']);
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
  async updateBlogVision(blogId: string, visionStatus: boolean) {
    const qbBlog = await this.blogRepositoryTypeOrm.createQueryBuilder('b');

    const update = await qbBlog
      .update(BlogEntity)
      .set({
        vision: visionStatus,
      })
      .where('id = :id', { id: blogId })
      .execute();

    if (!update.affected) {
      return false;
    }
    return true;
  }
}
