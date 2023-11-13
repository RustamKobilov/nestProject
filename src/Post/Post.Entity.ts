import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { likeStatus } from '../Enum';
import { BlogEntity } from '../Blog/Blog.Entity';
import { CommentEntity } from '../Comment/Comment.Entity';

@Entity()
export class PostEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
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

  @ManyToOne(() => BlogEntity, (blog) => blog.posts)
  @JoinColumn({ name: 'blogId' })
  blog: BlogEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  @JoinColumn({ name: 'blogId' })
  comments: CommentEntity[];
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
