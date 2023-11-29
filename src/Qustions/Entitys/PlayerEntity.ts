// import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
// import { AnswerViewModel } from '../questionDTO';
// import { gameStatusesEnum } from '../questionEnum';
// import { GameEntity } from './GameEntity';
//
// @Entity()
// export class PlayerEntity {
//   @PrimaryColumn({ type: 'uuid' })
//   gameId: string;
//   @PrimaryColumn({ type: 'uuid' })
//   playerId: string;
//   @Column({ type: 'varchar' })
//   playerLogin: string;
//   @Column({ type: 'integer' })
//   playerScore: number;
//   @Column('text', { array: true, default: '{}' })
//   playerAnswers: AnswerViewModel[] = [];
//   @Column({
//     type: 'enum',
//     enum: [
//       gameStatusesEnum.PendingSecondPlayer,
//       gameStatusesEnum.Active,
//       gameStatusesEnum.Finished,
//     ],
//   })
//   @ManyToOne(() => GameEntity, (game) => game.players)
//   @JoinColumn({ name: 'idGame', referencedColumnName: 'id' })
//   game: GameEntity;
// }
//
// export type PlayerEntityType = {
//   gameId: string;
//   playerId: string;
//   playerLogin: string;
//   playerScore: number;
//   playerAnswers: AnswerViewModel[];
// };
