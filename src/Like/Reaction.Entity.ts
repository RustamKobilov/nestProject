import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { likeStatus } from '../Enum';

export class ReactionEntity {
  @PrimaryGeneratedColumn()
  idSql: number;
  @Column({ type: 'uuid' })
  parentId: string;
  @Column({ type: 'uuid' })
  userId: string;
  @Column({ type: 'varchar', length: 20 })
  userLogin;
  @Column({ type: 'enum', enum: likeStatus })
  status: likeStatus;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
}
