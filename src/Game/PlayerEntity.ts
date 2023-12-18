import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class PlayerEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
  @Column({ type: 'varchar' })
  login: string;
  @Column({ type: 'integer' })
  games: number;
  @Column({ type: 'integer' })
  scores: number;
  @Column({ type: 'integer' })
  wins: number;
  @Column({ type: 'integer' })
  draws: number;
  @Column({ type: 'integer' })
  losses: number;
  @Column({ type: 'integer' })
  avgScores: number;
}

export type updatePlayerStaticAfterGame = {
  games: 0 | 1;
  scores: number;
  wins: 0 | 1;
  draws: 0 | 1;
  losses: 0 | 1;
};
