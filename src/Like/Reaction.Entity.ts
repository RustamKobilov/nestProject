import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { likeStatus } from '../Enum';
@Entity()
export class ReactionEntity {
  @PrimaryColumn({ type: 'uuid' })
  parentId: string;
  @PrimaryColumn({ type: 'uuid' })
  userId: string;
  @Column({ type: 'varchar', length: 20 })
  userLogin: string;
  @Column({ type: 'enum', enum: likeStatus })
  status: likeStatus;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
}
