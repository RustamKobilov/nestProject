import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { gameStatusesEnum } from '../questionEnum';
import { AnswerViewModel, QuestionViewModel } from '../questionDTO';

@Entity()
export class GameEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
  @Column({ type: 'uuid' })
  firstPlayerId: string;
  @Column({ type: 'varchar' })
  firstPlayerLogin: string;
  @Column({ type: 'number' })
  firstPlayerScore: number;
  @Column('text', { array: true, default: '{}' })
  firstPlayerAnswers: AnswerViewModel[] = [];
  @Column({ type: 'uuid' })
  secondPlayerId: string;
  @Column({ type: 'varchar' })
  secondPlayerLogin: string;
  @Column({ type: 'number' })
  secondPlayerScore: number;
  @Column('text', { array: true, default: '{}' })
  secondPlayerAnswers: AnswerViewModel[] = [];
  @Column('text', { array: true, default: '{}' })
  questions: QuestionViewModel[] = [];
  @Column({
    type: 'enum',
    enum: [
      gameStatusesEnum.Active,
      gameStatusesEnum.Finished,
      gameStatusesEnum.PendingSecondPlayer,
    ],
  })
  status: gameStatusesEnum;
  @Column({ type: 'varchar' })
  pairCreatedDate: string;
  @Column({ type: 'varchar', nullable: true })
  startGameDate: string | null;
  @Column({ type: 'varchar', nullable: true })
  finishGameDate: string | null;
}
// export type GameEntityType = {
//   id: string;
//   status: gameStatusesEnum;
//   pairCreatedDate: string;
//   startGameDate: string | null;
//   finishGameDate: string | null;
// };
