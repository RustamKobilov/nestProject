import { BlogImageEntity } from './Entity/BlogImage.Entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PostImageEntity } from './Entity/PostImage.Entity';
import { ImageFormat, ImagePurpose } from '../Enum';

@Injectable()
export class ImagesRepository {
  constructor(
    @InjectRepository(BlogImageEntity)
    private readonly blogImageRepositoryTypeOrm: Repository<BlogImageEntity>,
    @InjectRepository(PostImageEntity)
    private readonly postImageRepositoryTypeOrm: Repository<PostImageEntity>,
  ) {}

  async CreateImageForBlogImageRepository(image: BlogImageEntity) {
    try {
      await this.blogImageRepositoryTypeOrm.save(image);
    } catch (e) {
      console.log(e);
      throw new BadRequestException(' async CreateImage(image: BlogImage) {');
    }
  }

  async CreateImageForPostImageRepository(image: PostImageEntity) {
    try {
      await this.postImageRepositoryTypeOrm.save(image);
      //он проверяет все и не выкидывает ошибки
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        ' async CreateImageForPostImageRepository(image: BlogImage) {',
      );
    }
  }

  async getImageForBlogImageRepository(blogId: string) {
    try {
      const qbImageBlog =
        await this.blogImageRepositoryTypeOrm.createQueryBuilder('bImg');

      const imagesForBlog = await qbImageBlog
        .where('bImg.blogId = :blogId', {
          blogId: blogId,
        })
        .orderBy('bImg.createdAt', 'DESC')
        .getMany();

      return imagesForBlog;
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        ' async getImageForBlogImageRepository(blogId: string,purpose:ImagePurpose) {',
      );
    }
  }
  async getImageForBlogByLimitAndPurpose(
    blogId: string,
    limit: number,
    purpose: ImagePurpose,
  ) {
    try {
      const qbImageBlog =
        await this.blogImageRepositoryTypeOrm.createQueryBuilder('bImg');

      const imagesForBlog = await qbImageBlog
        .where('bImg.blogId = :blogId AND bImg.purpose = :purpose', {
          blogId: blogId,
          purpose: purpose,
        })
        .orderBy('bImg.createdAt', 'DESC')
        .limit(limit)
        .getMany();

      return imagesForBlog;
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        ' async getImageForBlogImageRepository(blogId: string,purpose:ImagePurpose) {',
      );
    }
  }

  async getImageForPostImageRepository(postId: string) {
    try {
      const qbImagePost =
        await this.postImageRepositoryTypeOrm.createQueryBuilder('pImg');

      const imagesForPost = await qbImagePost
        .where('pImg.postId = :postId', {
          postId: postId,
        })
        .orderBy('pImg.createdAt', 'DESC')
        .getMany();

      return imagesForPost;
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        ' async getImageForPostImageRepository(postId: string) {',
      );
    }
  }
  async getImageForPostByLimitAndPurpose(
    postId: string,
    limit: number,
    purpose: ImagePurpose,
  ) {
    try {
      const qbImagePost =
        await this.postImageRepositoryTypeOrm.createQueryBuilder('pImg');

      const imagesForPost = await qbImagePost
        .where('pImg.postId = :postId AND pImg.purpose = :purpose', {
          postId: postId,
          purpose: purpose,
        })
        .orderBy('pImg.createdAt', 'DESC')
        .limit(limit)
        .getMany();

      return imagesForPost;
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        ' async getImageForBlogImageRepository(blogId: string,purpose:ImagePurpose) {',
      );
    }
  }
}
