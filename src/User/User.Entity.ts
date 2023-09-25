import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryColumn({ type: 'uuid', length: 36 })
  id: string;
  @Column({ type: 'varchar', length: 20 })
  login: string;
  @Column({ type: 'varchar', length: 20 })
  password: string;
  @Column({ type: 'varchar', length: 40 })
  email: string;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
  @Column({ type: 'varchar', length: 30 })
  salt: string;
}
@Entity()
export class UserConfirmationInfoEntity {
  @Column({ type: 'uuid', length: 36 })
  ownerId: string;
  @Column({ type: 'boolean' })
  userConformation: boolean;
  @Column({ type: 'uuid', length: 36 })
  code: string;
  @Column({ type: 'varchar', length: 30 })
  expirationCode: string;
}

@Entity()
export class UserRecoveryPasswordInfoEntity {
  @Column({ type: 'uuid', length: 36 })
  ownerId: string;
  @Column({ type: 'uuid', length: 36 })
  recoveryCode: string;
  @Column({ type: 'varchar', length: 30 })
  diesAtDate: string;
}

// @Prop({ required: true, type: UserConfirmationInfoSchema })
// iduserConfirmationInfo: UserConfirmationInfo;
// @Prop({ required: true, type: UserRecoveryPasswordInfoSchema })
// recoveryPasswordInfo: UserRecoveryPasswordInfo;

// import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
//
// @Entity()
// export class User {
//   /**
//    * this decorator will help to auto generate id for the table.
//    */
//   @PrimaryGeneratedColumn()
//   id: number;
//
//   @Column({ type: 'varchar', length: 30 })
//   name: string;
//
//   @Column({ type: 'varchar', length: 15 })
//   username: string;
//
//   @Column({ type: 'varchar', length: 40 })
//   email: string;
//
//   @Column({ type: 'int' })
//   age: number;
//
//   @Column({ type: 'varchar' })
//   password: string;
//
//   @Column({ type: 'enum', enum: ['m', 'f', 'u'] })
//   /**
//    * m - male
//    * f - female
//    * u - unspecified
//    */
//   gender: string;
// }
