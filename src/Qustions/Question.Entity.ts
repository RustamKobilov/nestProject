import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class QuestionEntity {
  @PrimaryColumn({ type: 'uuid', unique: true })
  id: string;
  @Column({ type: 'varchar' })
  body: string;
  @Column('text', { array: true, default: '{}' })
  correctAnswers: string[];
  @Column({ type: 'boolean' })
  published: boolean;
  @Column({ type: 'varchar', length: 30 })
  createdAt: string;
  @Column({ type: 'varchar', nullable: true })
  updatedAt: string | null;
}
