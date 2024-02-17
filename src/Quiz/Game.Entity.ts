import { Column, Entity, PrimaryColumn } from 'typeorm';
import { gameStatusesEnum } from '../Qustions/questionEnum';
import { AnswerViewModel, QuestionViewModel } from '../Qustions/questionDTO';

@Entity()
export class GameEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
  @Column({ type: 'uuid' })
  firstPlayerId: string;
  @Column({ type: 'varchar' })
  firstPlayerLogin: string;
  @Column({ type: 'integer' })
  firstPlayerScore: number;
  @Column('jsonb', { array: false, default: '{}' })
  firstPlayerAnswers: AnswerViewModel[] = [];
  @Column({ type: 'uuid', nullable: true })
  secondPlayerId: string | null;
  @Column({ type: 'varchar', nullable: true })
  secondPlayerLogin: string | null;
  @Column({ type: 'integer' })
  secondPlayerScore: number;
  @Column('jsonb', { array: false, default: '{}' })
  secondPlayerAnswers: AnswerViewModel[] = [];
  @Column('jsonb', { array: false, default: '{}' })
  questions: QuestionInGameEntityType[] = [];
  @Column({
    type: 'enum',
    enum: [
      gameStatusesEnum.Active,
      gameStatusesEnum.Finished,
      gameStatusesEnum.PendingSecondPlayer,
    ],
  })
  status: gameStatusesEnum;
  @Column({ type: 'varchar', length: 30 })
  pairCreatedDate: string;
  @Column({ type: 'varchar', nullable: true })
  startGameDate: string | null;
  @Column({ type: 'varchar', nullable: true })
  finishGameDate: string | null;
}

export type PlayerInformation = {
  playerId: string;
  playerLogin: string;
};

export type QuestionInGameEntityType = {
  id: string;
  body: string;
  correctAnswers: string[];
};
