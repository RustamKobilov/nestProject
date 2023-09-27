import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

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
}
@Entity()
export class CommentatorInfoEntity {
  @PrimaryGeneratedColumn()
  idSql: number;
  @Column({ type: 'uuid' })
  postId: string;
  @Column({ type: 'varchar', length: 30 })
  userLogin: string;
}
