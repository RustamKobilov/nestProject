import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { PostEntity } from '../Post/Post.Entity';

@Entity()
export class BlogEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
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

  @OneToMany(() => PostEntity, (post) => post.blog)
  //@JoinColumn({ name: 'blogId' })
  posts: PostEntity[];
}
