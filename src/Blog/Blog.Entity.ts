import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { PostEntity } from '../Post/Post.Entity';
import { BlogImageEntity } from '../Images/Entity/BlogImage.Entity';

@Entity()
export class BlogEntity {
  @PrimaryColumn({ type: 'uuid', unique: true })
  id: string;
  @Column({ type: 'uuid' })
  userId: string;
  @Column({ type: 'varchar', length: 15 })
  userLogin: string;
  @Column({ type: 'varchar', length: 15 })
  name: string;
  @Column({ type: 'varchar', length: 500 })
  description: string;
  @Column({ type: 'varchar', length: 100 })
  websiteUrl: string;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
  @Column({ type: 'boolean' })
  isMembership: boolean;
  @Column({ type: 'boolean' })
  vision: boolean;
  @Column({ type: 'varchar', length: 30, nullable: true })
  createdAtVision: string | null;

  @OneToMany(() => PostEntity, (post) => post.blog)
  posts: PostEntity[];
  @OneToMany(() => BlogImageEntity, (image) => image.blog)
  images: BlogImageEntity[];
}
