import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './User.Entity';

@Entity()
export class UserRecoveryPasswordInfoEntity {
  @PrimaryGeneratedColumn()
  idSql: number;
  @Column({ type: 'uuid' })
  ownerId: string;
  @Column({ type: 'varchar', length: 36 })
  recoveryCode: string;
  @Column({ type: 'varchar', length: 30 })
  diesAtDate: string;
  @OneToOne(() => UserEntity, (user) => user.userRecoveryPasswordInfo)
  @JoinColumn({ name: 'ownerId' })
  user: UserEntity;
}
