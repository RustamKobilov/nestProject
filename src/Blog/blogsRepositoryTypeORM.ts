import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './Blog.Entity';
import { Repository } from 'typeorm';
import { Blog } from './Blog';
import { BlogPaginationDTO, CreateBlogDTO, outputModel } from '../DTO';
import { helper } from '../helper';
import { mapObject } from '../mapObject';
import { BlogViewModel, SaBlogViewModel } from '../viewModelDTO';
import { ImagesRepository } from '../Images/imageRepository';
import { countMainImageForBlog, countWallpaperImageForBlog } from '../constant';
import { ImagePurpose } from '../Enum';

@Injectable()
export class BlogsRepositoryTypeORM {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepositoryTypeOrm: Repository<BlogEntity>,
    private readonly imageRepository: ImagesRepository,
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
    const totalCountBlog = await qbBlog
      .where(filter.where, filter.params)
      //.andWhere('b.vision = :vision', { vision: true })
      .getCount();
    const sortDirection = paginationBlog.sortDirection === 1 ? 'ASC' : 'DESC';
    const paginationFromHelperForBlogs =
      helper.getPaginationFunctionSkipSortTotal(
        paginationBlog.pageNumber,
        paginationBlog.pageSize,
        totalCountBlog,
      );

    const blogs = await qbBlog
      .where(searchNameTermFilter.where, searchNameTermFilter.params)
      .andWhere('b.vision = :vision', { vision: true })
      .orderBy('b.' + paginationBlog.sortBy, sortDirection)
      .limit(paginationBlog.pageSize)
      .offset(paginationFromHelperForBlogs.skipPage)
      .getMany();

    const blogsViewModel: BlogViewModel[] = [];

    if (blogs.length > 0) {
      for (const blog of blogs) {
        const imageWallpaper =
          await this.imageRepository.getImageForBlogByLimitAndPurpose(
            blog.id,
            countWallpaperImageForBlog,
            ImagePurpose.wallpaper,
          );
        const imageMain =
          await this.imageRepository.getImageForBlogByLimitAndPurpose(
            blog.id,
            countMainImageForBlog,
            ImagePurpose.main,
          );
        console.log(imageMain, 'imageMain');
        const blogViewModel = mapObject.mapBlogAndImageArrayForBlogViewModel(
          blog,
          imageWallpaper,
          imageMain,
        );
        blogsViewModel.push(blogViewModel);
      }
    }

    return {
      pagesCount: paginationFromHelperForBlogs.totalCount,
      page: paginationBlog.pageNumber,
      pageSize: paginationBlog.pageSize,
      totalCount: totalCountBlog,
      items: blogsViewModel,
    };
  }
  //TODO логика админа не реализована
  async getBlogsForSa(
    paginationBlog: BlogPaginationDTO,
    searchNameTermFilter,
  ): Promise<outputModel<SaBlogViewModel>> {
    const qbBlog = await this.blogRepositoryTypeOrm.createQueryBuilder('b');
    const totalCountBlog = await qbBlog
      .where(searchNameTermFilter.where, searchNameTermFilter.params)
      .getCount();

    const sortDirection = paginationBlog.sortDirection === 1 ? 'ASC' : 'DESC';
    const paginationFromHelperForBlogs =
      helper.getPaginationFunctionSkipSortTotal(
        paginationBlog.pageNumber,
        paginationBlog.pageSize,
        totalCountBlog,
      );

    const blogs = await qbBlog
      .where(searchNameTermFilter.where, searchNameTermFilter.params)
      //.andWhere('b.vision = :vision', { vision: true })
      .orderBy('b.' + paginationBlog.sortBy, sortDirection)
      .limit(paginationBlog.pageSize)
      .offset(paginationFromHelperForBlogs.skipPage)
      .getMany();

    const blogsViewModel: SaBlogViewModel[] = [];

    // if (blogs.length > 0) {
    //   for (const blog of blogs) {
    //     const imageWallpaper =
    //       await this.imageRepository.getImageForBlogByLimitAndPurpose(
    //         blog.id,
    //         countWallpaperImageForBlog,
    //         ImagePurpose.wallpaper,
    //       );
    //     const imageMain =
    //       await this.imageRepository.getImageForBlogByLimitAndPurpose(
    //         blog.id,
    //         countMainImageForBlog,
    //         ImagePurpose.main,
    //       );
    //     console.log(imageMain, 'imageMain');
    //     const blogViewModel = mapObject.mapBlogAndImageArrayForBlogViewModel(
    //       blog,
    //       imageWallpaper,
    //       imageMain,
    //     );
    //     blogsViewModel.push(blogViewModel);
    //   }
    // }
    const resultBlogs = await Promise.all(
      blogs.map(async (blog: BlogEntity) => {
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
  ): Promise<outputModel<BlogViewModel>> {
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

    const blogs = await qbBlog
      .where(searchNameTermFilter.where, searchNameTermFilter.params)
      .andWhere('b.vision = :vision', { vision: true })
      .orderBy('b.' + paginationBlog.sortBy, sortDirection)
      .limit(paginationBlog.pageSize)
      .offset(paginationFromHelperForBlogs.skipPage)
      .getMany();

    const blogsViewModel: BlogViewModel[] = [];

    if (blogs.length > 0) {
      for (const blog of blogs) {
        const imageWallpaper =
          await this.imageRepository.getImageForBlogByLimitAndPurpose(
            blog.id,
            countWallpaperImageForBlog,
            ImagePurpose.wallpaper,
          );
        const imageMain =
          await this.imageRepository.getImageForBlogByLimitAndPurpose(
            blog.id,
            countMainImageForBlog,
            ImagePurpose.main,
          );
        const blogViewModel = mapObject.mapBlogAndImageArrayForBlogViewModel(
          blog,
          imageWallpaper,
          imageMain,
        );
        blogsViewModel.push(blogViewModel);
      }
    }

    return {
      pagesCount: paginationFromHelperForBlogs.totalCount,
      page: paginationBlog.pageNumber,
      pageSize: paginationBlog.pageSize,
      totalCount: totalCountBlog,
      items: blogsViewModel,
    };
  }
  async getBlog(blogId: string): Promise<BlogEntity | false> {
    const qbBlog = await this.blogRepositoryTypeOrm.createQueryBuilder('b');

    const blog = await qbBlog
      .where('id = :id', { id: blogId })
      .andWhere('b.vision = :vision', { vision: true })
      .getOne();

    if (!blog) {
      return false;
    }

    // const imageWallpaper =
    //   await this.imageRepository.getImageForBlogByLimitAndPurpose(
    //     blog.id,
    //     countWallpaperImageForBlog,
    //     ImagePurpose.wallpaper,
    //   );
    // const imageMain =
    //   await this.imageRepository.getImageForBlogByLimitAndPurpose(
    //     blog.id,
    //     countMainImageForBlog,
    //     ImagePurpose.main,
    //   );
    // const blogViewModel = mapObject.mapBlogAndImageArrayForBlogViewModel(
    //   blog,
    //   imageWallpaper,
    //   imageMain,
    // );

    return blog;
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
        createdAtVision:
          visionStatus === true ? null : new Date().toISOString(),
      })
      .where('id = :id', { id: blogId })
      .execute();

    if (!update.affected) {
      return false;
    }
    return true;
  }
}
