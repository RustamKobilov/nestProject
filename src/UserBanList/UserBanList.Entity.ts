import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../User/User.Entity';

@Entity()
export class UserBanListEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
  @Column({ type: 'varchar', length: 100, nullable: true })
  banDate: string;
  @Column({ type: 'varchar', length: 100, nullable: true })
  banReason: string;

  @OneToOne(() => UserEntity, (user) => user.userBanList)
  @JoinColumn({ name: 'id' })
  user: UserEntity;
}
