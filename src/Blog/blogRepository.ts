import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './Blog';
import { FilterQuery, Model, UpdateWriteOpResult } from 'mongoose';
import { BlogPaginationDTO, CreateBlogDTO, outputModel } from '../DTO';
import { helper } from '../helper';
import { mapObject } from '../mapObject';
import { BlogViewModel, SaBlogViewModel } from '../viewModelDTO';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createBlog(newBlog: Blog) {
    const createBlog = new this.blogModel(newBlog);
    await createBlog.save();
    return;
  }
  getSearchNameTermFilterBlog(
    paginationBlog: BlogPaginationDTO,
  ): FilterQuery<BlogDocument> {
    const searchNameTermFilter =
      paginationBlog.searchNameTerm != null
        ? {
            name: { $regex: paginationBlog.searchNameTerm, $options: 'i' },
          }
        : {};
    return searchNameTermFilter;
  }
  async getBlogsForBlogger(
    paginationBlog: BlogPaginationDTO,
    searchNameTermFilter: FilterQuery<BlogDocument>,
    userId: string,
  ): Promise<outputModel<BlogViewModel>> {
    const filter: FilterQuery<BlogDocument> = {
      userId: userId,
      ...searchNameTermFilter,
    };
    const totalCountUser = await this.blogModel.count({ ...filter });
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        paginationBlog.pageNumber,
        paginationBlog.pageSize,
        totalCountUser,
      );

    const sortBlog = await this.blogModel
      .find(
        { ...filter },
        {
          _id: 0,
          __v: 0,
          hash: 0,
          salt: 0,
          password: 0,
          userConfirmationInfo: 0,
        },
      )
      .sort({ [paginationBlog.sortBy]: paginationBlog.sortDirection })
      .skip(paginationFromHelperForUsers.skipPage)
      .limit(paginationBlog.pageSize)
      .lean()
      .exec();

    const resultBlogs = await Promise.all(
      sortBlog.map(async (blog: Blog) => {
        const blogView = await mapObject.mapBlogForViewModel(blog);
        return blogView;
      }),
    );

    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: paginationBlog.pageNumber,
      pageSize: paginationBlog.pageSize,
      totalCount: totalCountUser,
      items: resultBlogs,
    };
  }

  async getBlog(blogId: string): Promise<Blog | false> {
    const blog = await this.blogModel.findOne({ id: blogId });
    if (!blog) {
      return false;
    }
    return blog;
  }
  async updateBlog(blogId: string, updateBlogDto: CreateBlogDTO) {
    const updateBlog: UpdateWriteOpResult = await this.blogModel.updateOne(
      { id: blogId },
      {
        name: updateBlogDto.name,
        description: updateBlogDto.description,
        websiteUrl: updateBlogDto.websiteUrl,
      },
    );
    return updateBlog.matchedCount === 1;
  }

  async deleteBlog(blogId: string) {
    return await this.blogModel.deleteOne({ id: blogId });
  }

  async getBlogsForSa(
    paginationBlog: BlogPaginationDTO,
    searchNameTermFilter,
  ): Promise<outputModel<SaBlogViewModel>> {
    const totalCountUser = await this.blogModel.count({
      ...searchNameTermFilter,
    });
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        paginationBlog.pageNumber,
        paginationBlog.pageSize,
        totalCountUser,
      );

    const sortBlog = await this.blogModel
      .find(
        { ...searchNameTermFilter },
        {
          _id: 0,
          __v: 0,
          hash: 0,
          salt: 0,
          password: 0,
          userConfirmationInfo: 0,
        },
      )
      .sort({ [paginationBlog.sortBy]: paginationBlog.sortDirection })
      .skip(paginationFromHelperForUsers.skipPage)
      .limit(paginationBlog.pageSize)
      .lean()
      .exec();

    const resultBlogs = await Promise.all(
      sortBlog.map(async (blog: Blog) => {
        const saBlogView = await mapObject.mapSaBlogForViewModel(blog);
        return saBlogView;
      }),
    );

    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: paginationBlog.pageNumber,
      pageSize: paginationBlog.pageSize,
      totalCount: totalCountUser,
      items: resultBlogs,
    };
  }
  async updateBlogVision(blogId: string, visionStatus: boolean) {
    return true;
  }
  async getBlogs(
    paginationBlog: BlogPaginationDTO,
    searchNameTermFilter,
  ): Promise<outputModel<BlogViewModel>> {
    const totalCountUser = await this.blogModel.count({
      ...searchNameTermFilter,
    });
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        paginationBlog.pageNumber,
        paginationBlog.pageSize,
        totalCountUser,
      );

    const sortBlog = await this.blogModel
      .find(
        { ...searchNameTermFilter },
        {
          _id: 0,
          __v: 0,
          hash: 0,
          salt: 0,
          password: 0,
          userConfirmationInfo: 0,
        },
      )
      .sort({ [paginationBlog.sortBy]: paginationBlog.sortDirection })
      .skip(paginationFromHelperForUsers.skipPage)
      .limit(paginationBlog.pageSize)
      .lean()
      .exec();

    const resultBlogs = await Promise.all(
      sortBlog.map(async (blog: Blog) => {
        const blogView = await mapObject.mapBlogForViewModel(blog);
        return blogView;
      }),
    );

    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: paginationBlog.pageNumber,
      pageSize: paginationBlog.pageSize,
      totalCount: totalCountUser,
      items: resultBlogs,
    };
  }
}
