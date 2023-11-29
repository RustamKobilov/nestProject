import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { likeStatus } from '../Enum';
import { PostEntity } from '../Post/Post.Entity';

@Entity()
export class CommentEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
  @Column({ type: 'uuid' })
  postId: string;
  @Column({ type: 'varchar', length: 300 })
  content: string;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
  @Column({ type: 'varchar', length: 30 })
  userLogin: string;
  @Column({ type: 'uuid' })
  userId: string;
  @Column({ type: 'integer' })
  likesCount: number;
  @Column({ type: 'integer' })
  dislikesCount: number;
  @Column({
    type: 'enum',
    enum: [likeStatus.None, likeStatus.Like, likeStatus.Dislike],
  })
  myStatus: likeStatus;

  @ManyToOne(() => PostEntity, (post) => post.comments)
  //@JoinColumn({ name: 'postId' })
  post: PostEntity;
}
