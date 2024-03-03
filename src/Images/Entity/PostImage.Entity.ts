import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ImageFormat, ImagePurpose } from '../../Enum';
import { PostEntity } from '../../Post/Post.Entity';

@Entity()
export class PostImageEntity {
  @PrimaryColumn({ type: 'varchar', length: 600, unique: true })
  url: string;
  @Column({ type: 'varchar', length: 600, unique: true })
  urlDownload: string;
  @Column({ type: 'uuid' })
  postId: string;
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
  @ManyToOne(() => PostEntity, (post) => post.images)
  post: PostEntity;

  static CreateEntity(
    url: string,
    urlDownload: string,
    postId: string,
    createdAt: string,
    width: number,
    height: number,
    fileSize: number,
    type: ImageFormat,
    purpose: ImagePurpose,
  ): PostImageEntity {
    const postImageEntity = new PostImageEntity();
    postImageEntity.url = url;
    postImageEntity.urlDownload = urlDownload;
    postImageEntity.postId = postId;
    postImageEntity.createdAt = createdAt;
    postImageEntity.width = width;
    postImageEntity.height = height;
    postImageEntity.fileSize = fileSize;
    postImageEntity.type = type;
    postImageEntity.purpose = purpose;
    return postImageEntity;
  }
}
