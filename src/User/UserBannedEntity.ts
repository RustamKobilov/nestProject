import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class UserBanListEntity {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;
  @Column({ type: 'varchar', length: 50 })
  banReason: string;
}
