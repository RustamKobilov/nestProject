import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class PostEntity {
  @PrimaryColumn({ type: 'uuid', length: 36 })
  id: string;
  @Column({ type: 'varchar', length: 30 })
  title: string;
  @Column({ type: 'varchar', length: 100 })
  shortDescription: string;
  @Column({ type: 'varchar', length: 1000 })
  content: string;
  @Column({ type: 'uuid', length: 36 })
  blogId: string;
  @Column({ type: 'varchar', length: 15 })
  blogName: string;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
}
@Entity()
export class NewestLikesEntity {
  @Column({ type: 'uuid', length: 36 })
  userId: string;
  @Column({ type: 'varchar', length: 30 })
  addedAt: string;
  @Column({ type: 'varchar', length: 10 })
  login: string;
}
//TODO когда появляются таблицы созданные из entity

// @Entity()
// export class ExtendedLikesInfoEntity {
//   @Column({ type: 'int' })
//   likesCount: number;
//   @Column({ type: 'int' })
//   dislikesCount: number;
//   @Column({ type: 'enum', enum: [likeStatus] })
//   myStatus: likeStatus;
// }
