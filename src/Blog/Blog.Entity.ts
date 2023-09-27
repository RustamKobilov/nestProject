import { Column, Entity, PrimaryColumn } from 'typeorm';

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
}
