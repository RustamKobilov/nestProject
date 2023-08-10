import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './Blog';
import { FilterQuery, Model } from 'mongoose';
import {
  BlogPaginationDTO,
  CreateBlogDTO,
  outputModel,
  PaginationDTO,
} from '../DTO';
import { helper } from '../helper';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async checkDuplicateName(blogName: string) {
    const searchName = { name: { $regex: blogName, $options: 'i' } };

    const blogCount = await this.blogModel.count(searchName);

    if (blogCount > 0) {
      throw new BadRequestException(`name dublicate`);
    }
    return;
  }

  async createBlog(newBlog: Blog) {
    const createBlog = new this.blogModel(newBlog);
    await createBlog.save();
    return;
  }
  getFilterBlog(paginationBlog: BlogPaginationDTO): FilterQuery<BlogDocument> {
    const searchNameTermFilter =
      paginationBlog.searchNameTerm != null
        ? {
            name: { $regex: paginationBlog.searchNameTerm, $options: 'i' },
          }
        : {};
    return searchNameTermFilter;
  }
  async getBlogs(
    paginationBlog: BlogPaginationDTO,
    filter: FilterQuery<BlogDocument>,
  ): Promise<outputModel<Blog>> {
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
      .lean();

    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: paginationBlog.pageNumber,
      pageSize: paginationBlog.pageSize,
      totalCount: totalCountUser,
      items: sortBlog,
    };
  }

  async getBlog(blogId: string): Promise<Blog> {
    const blog = await this.blogModel.findOne({ id: blogId });
    if (!blog) {
      throw new NotFoundException('If specified blog is not exists');
    }
    return blog;
  }
  async updateBlog(blogId: string, updateBlogDto: CreateBlogDTO) {
    await this.getBlog(blogId);
    const updateBlog = await this.blogModel.updateOne(
      { id: blogId },
      {
        name: updateBlogDto.name,
        description: updateBlogDto.description,
        websiteUrl: updateBlogDto.websiteUrl,
      },
    );
    return;
  }

  async deleteBlog(blogId: string) {
    await this.blogModel.deleteOne({ id: blogId });
    return;
  }
}
