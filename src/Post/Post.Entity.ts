import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { likeStatus } from '../Enum';
import { BlogEntity } from '../Blog/Blog.Entity';
import { CommentEntity } from '../Comment/Comment.Entity';
import { PostImageEntity } from '../Images/Entity/PostImage.Entity';

@Entity()
export class PostEntity {
  @PrimaryColumn({ type: 'uuid', unique: true })
  id: string;
  @Column({ type: 'uuid' })
  userId: string;
  @Column({ type: 'varchar', length: 30 })
  title: string;
  @Column({ type: 'varchar', length: 100 })
  shortDescription: string;
  @Column({ type: 'varchar', length: 1000 })
  content: string;
  @Column({ type: 'uuid' })
  blogId: string;
  @Column({ type: 'varchar', length: 15 })
  blogName: string;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
  @Column({ type: 'integer' })
  likesCount: number;
  @Column({ type: 'integer' })
  dislikesCount: number;
  @Column({
    type: 'enum',
    enum: [likeStatus.None, likeStatus.Like, likeStatus.Dislike],
  })
  myStatus: likeStatus;
  @Column({ type: 'boolean' })
  vision: boolean;

  @ManyToOne(() => BlogEntity, (blog) => blog.posts)
  blog: BlogEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];
  @OneToMany(() => PostImageEntity, (image) => image.post)
  images: PostImageEntity[];
}

// @Entity()
// export class ExtendedLikesInfoEntity {
//   @Column({ type: 'int' })
//   likesCount: number;
//   @Column({ type: 'int' })
//   dislikesCount: number;
//   @Column({ type: 'enum', enum: [likeStatus] })
//   myStatus: likeStatus;
// }
// @Column({ type: 'json' })
//   newestLikes: []
//  @Column({ type: 'enum', enum: [likeStatus] })
//   myStatus: likeStatus;
