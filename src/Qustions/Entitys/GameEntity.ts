import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { gameStatusesEnum } from '../questionEnum';
import { PlayerEntity } from './PlayerEntity';

@Entity()
export class GameEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
  @Column({
    type: 'enum',
    enum: [gameStatusesEnum.Active, gameStatusesEnum.Finished],
  })
  status: gameStatusesEnum;
  @Column({ type: 'varchar' })
  pairCreatedDate: string;
  @Column({ type: 'varchar' })
  startGameDate: string;
  @Column({ type: 'varchar', nullable: true })
  finishGameDate: string | null;

  @OneToMany(() => PlayerEntity, (player) => player.game)
  players: PlayerEntity[];
}
export type GameEntityType = {
  id: string;
  status: gameStatusesEnum.Active | gameStatusesEnum.Finished;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string | null;
};
