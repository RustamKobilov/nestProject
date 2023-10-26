import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogPaginationDTO, CreateBlogDTO, outputModel } from '../DTO';
import { Blog } from './Blog';
import { helper } from '../helper';
import { mapObject } from '../mapObject';

@Injectable()
export class BlogsRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async createBlog(newBlog: Blog) {
    const queryInsertBlogEntity = await this.dataSource.query(
      'INSERT INTO blog_entity ("id","name", "description", "websiteUrl", "createdAt", "isMembership")' +
        ' VALUES ($1,$2, $3, $4, $5, $6)',
      [
        newBlog.id,
        newBlog.name,
        newBlog.description,
        newBlog.websiteUrl,
        newBlog.createdAt,
        newBlog.isMembership,
      ],
    );
    return;
  }
  getFilterBlog(paginationBlog: BlogPaginationDTO): string | null {
    const searchNameTermFilter =
      paginationBlog.searchNameTerm != null
        ? ' WHERE "name" LIKE ' + "'%" + paginationBlog.searchNameTerm + "%'"
        : null;
    return searchNameTermFilter;
  }

  async getBlogs(
    paginationBlog: BlogPaginationDTO,
    filter: string | null,
  ): Promise<outputModel<Blog>> {
    const filterCount =
      filter === null
        ? 'SELECT COUNT (*) FROM blog_entity'
        : 'SELECT COUNT (*)  FROM blog_entity ' + filter;
    const sortDirection = paginationBlog.sortDirection === 1 ? 'ASC' : 'DESC';
    const queryCountBlog = await this.dataSource.query(filterCount);
    console.log('filterCount');
    console.log(filterCount);
    const totalCountBlog = queryCountBlog[0].count;
    console.log(totalCountBlog);
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        paginationBlog.pageNumber,
        paginationBlog.pageSize,
        totalCountBlog,
      );
    console.log(paginationBlog);
    const whereFilter = filter === null ? '' : filter;
    const zapros =
      'SELECT  "id", "name", "description", "websiteUrl", "createdAt", "isMembership"' +
      ' FROM blog_entity' +
      whereFilter +
      ' ORDER BY' +
      ' "' +
      paginationBlog.sortBy +
      '" ' +
      sortDirection +
      ' LIMIT ' +
      paginationBlog.pageSize +
      ' OFFSET ' +
      paginationFromHelperForUsers.skipPage;
    console.log(zapros);
    const table = await this.dataSource.query(zapros);
    console.log(table);
    const resultBlogs = await Promise.all(
      table.map(async (blog: Blog) => {
        const blogView = await mapObject.mapBlogForViewModel(blog);
        return blogView;
      }),
    );
    //console.log(resultUsers);
    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: paginationBlog.pageNumber,
      pageSize: paginationBlog.pageSize,
      totalCount: totalCountBlog,
      items: resultBlogs,
    };
  }
  async getBlog(blogId: string): Promise<Blog | false> {
    const table = await this.dataSource.query(
      'SELECT  "id", "name", "description", "websiteUrl", "createdAt", "isMembership"' +
        ' FROM blog_entity WHERE "id" = $1',
      [blogId],
    );
    if (table.length < 1) {
      return false;
    }
    const blog = mapObject.mapBlogForViewModel(table[0]);
    return blog;
  }
  async updateBlog(blogId: string, updateBlogDto: CreateBlogDTO) {
    const update = await this.dataSource.query(
      'UPDATE blog_entity ' +
        ' SET "name" = $1,"description" = $2,"websiteUrl" = $3' +
        ' WHERE "id" = $4',
      [
        updateBlogDto.name,
        updateBlogDto.description,
        updateBlogDto.websiteUrl,
        blogId,
      ],
    );
    console.log('update down');
    console.log(update);
    return update[1] === 1;
  }
  async deleteBlog(blogId: string) {
    const deleteUser = await this.dataSource.query(
      'DELETE FROM blog_entity' + ' WHERE "id" = $1',
      [blogId],
    );
    console.log(deleteUser[1]);
    if (deleteUser[1] != 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return;
  }
}
