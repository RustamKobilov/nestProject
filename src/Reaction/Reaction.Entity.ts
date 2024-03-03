import { Column, Entity, PrimaryColumn } from 'typeorm';
import { likeStatus } from '../Enum';

@Entity()
export class ReactionEntity {
  @PrimaryColumn({ type: 'uuid', unique: true })
  parentId: string;
  @PrimaryColumn({ type: 'uuid' })
  userId: string;
  @Column({ type: 'varchar', length: 20 })
  userLogin: string;
  @Column({ type: 'enum', enum: likeStatus })
  status: likeStatus;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
  @Column({ type: 'boolean' })
  vision: boolean;
}
