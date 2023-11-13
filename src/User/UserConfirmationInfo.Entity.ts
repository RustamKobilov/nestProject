import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './User.Entity';

@Entity()
export class UserConfirmationInfoEntity {
  @PrimaryGeneratedColumn()
  idSql: number;
  @Column({ type: 'uuid' })
  ownerId: string;
  @Column({ type: 'boolean' })
  userConformation: boolean;
  @Column({ type: 'uuid' })
  code: string;
  @Column({ type: 'varchar', length: 30 })
  expirationCode: string;

  @OneToOne(() => UserEntity, (user) => user.userConfirmationInfo)
  @JoinColumn({ name: 'ownerId' })
  user: UserEntity;
}
