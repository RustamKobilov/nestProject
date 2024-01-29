import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ParentBanListEntity {
  @PrimaryColumn({ type: 'uuid' })
  parentId: string;
  @PrimaryColumn({ type: 'uuid' })
  userId: string;
  @Column({ type: 'varchar', length: 20 })
  userLogin: string;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
  @Column({ type: 'varchar', length: 100 })
  banReason: string;
}
