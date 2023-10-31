import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { likeStatus } from '../Enum';

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
  @Column({ type: 'numeric' })
  likesCount: number;
  @Column({ type: 'numeric' })
  dislikesCount: number;
  @Column({
    type: 'enum',
    enum: [likeStatus.None, likeStatus.Like, likeStatus.Dislike],
  })
  myStatus: likeStatus;
}
// @Entity()
// export class CommentatorInfoEntity {
//   @PrimaryGeneratedColumn()
//   idSql: number;
//   @Column({ type: 'uuid' })
//   postId: string;
//   @Column({ type: 'varchar', length: 30 })
//   userLogin: string;
//   @Column({ type: 'varchar', length: 30 })
//   userId: string;
// }
