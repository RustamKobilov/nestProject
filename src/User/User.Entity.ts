import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { UserConfirmationInfoEntity } from './UserConfirmationInfo.Entity';
import { UserRecoveryPasswordInfoEntity } from './UserRecoveryPasswordInfo.Entity';

@Entity()
export class UserEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
  @Column({ type: 'varchar', length: 20 })
  login: string;
  @Column({ type: 'varchar', length: 100 })
  password: string;
  @Column({ type: 'varchar', length: 40 })
  email: string;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
  @Column({ type: 'varchar', length: 30 })
  salt: string;
  @Column({ type: 'boolean' })
  banField: boolean;
  @Column({ type: 'varchar', length: 100 })
  banReason: string;

  @OneToOne(
    () => UserConfirmationInfoEntity,
    (userConfirmationInfoEntity) => userConfirmationInfoEntity.user,
  )
  userConfirmationInfo: UserConfirmationInfoEntity;

  @OneToOne(
    () => UserRecoveryPasswordInfoEntity,
    (userRecoveryPasswordInfoEntity) => userRecoveryPasswordInfoEntity.user,
  )
  userRecoveryPasswordInfo: UserRecoveryPasswordInfoEntity;
}
