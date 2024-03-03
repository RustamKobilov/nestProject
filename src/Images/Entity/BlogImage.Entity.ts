import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ImageFormat, ImagePurpose } from '../../Enum';
import { BlogEntity } from '../../Blog/Blog.Entity';
//TODO почему unique не срабатывает
@Entity()
export class BlogImageEntity {
  @PrimaryColumn({ type: 'varchar', unique: true, length: 600 })
  url: string;
  @PrimaryColumn({ type: 'varchar', unique: true, length: 600 })
  urlDownload: string;
  @Column({ type: 'uuid' })
  blogId: string;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
  @Column({ type: 'integer' })
  width: number;
  @Column({ type: 'integer' })
  height: number;
  @Column({ type: 'integer' })
  fileSize: number;
  @Column({
    type: 'enum',
    enum: Object.values(ImageFormat),
  })
  type: ImageFormat;
  @Column({
    type: 'enum',
    enum: Object.values(ImagePurpose),
  })
  purpose: ImagePurpose;
  @ManyToOne(() => BlogEntity, (blog) => blog.images)
  blog: BlogEntity;
  static CreateEntity(
    url: string,
    urlDownload: string,
    blogId: string,
    createdAt: string,
    width: number,
    height: number,
    fileSize: number,
    type: ImageFormat,
    purpose: ImagePurpose,
  ): BlogImageEntity {
    const blogImageEntity = new BlogImageEntity();
    blogImageEntity.url = url;
    blogImageEntity.urlDownload = urlDownload;
    blogImageEntity.blogId = blogId;
    blogImageEntity.createdAt = createdAt;
    blogImageEntity.width = width;
    blogImageEntity.height = height;
    blogImageEntity.fileSize = fileSize;
    blogImageEntity.type = type;
    blogImageEntity.purpose = purpose;
    return blogImageEntity;
  }
}
