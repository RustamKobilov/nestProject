import { Column, Entity, PrimaryColumn } from 'typeorm';
import { gameStatusesEnum } from '../questionEnum';
import { AnswerViewModel } from '../questionDTO';

@Entity()
export class QuestionEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
  @Column({ type: 'varchar' })
  body: string;
  @Column('text', { array: true, default: '{}' })
  correctAnswers: string[];
  @Column({ type: 'boolean' })
  published: boolean;
  @Column({ type: 'varchar' })
  createdAt: string;
  @Column({ type: 'varchar' })
  updatedAt: string;
}
// @Entity()
// export class PlayerAwaitGame {
//   @IsString()
//   @IsUUID()
//   playerId: string;
//   @IsString()
//   @IsEnum(gameStatusesEnum.PendingSecondPlayer)
//   status: gameStatusesEnum.PendingSecondPlayer;
// }

@Entity()
export class PlayerEntity {
  @PrimaryColumn({ type: 'uuid' })
  idGame: string;
  @PrimaryColumn({ type: 'uuid' })
  playerId: string;
  @Column({ type: 'varchar' })
  playerLogin: string;
  @Column({ type: 'integer' })
  playerScore: number;
  @Column('text', { array: true, default: '{}' })
  playerAnswers: AnswerViewModel[] = [];
  @Column({
    type: 'enum',
    enum: [
      gameStatusesEnum.PendingSecondPlayer,
      gameStatusesEnum.Active,
      gameStatusesEnum.Finished,
    ],
  })
  status: gameStatusesEnum;
  @Column({ type: 'varchar' })
  playerPairCreatedDate: string;
}

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
}
// @Entity()
// export class GamePairEntity {
//   @IsString()
//   @IsUUID()
//   id: string;
//   @IsString()
//   @IsUUID()
//   firstPlayerId: string;
//   @IsString()
//   firstPlayerLogin: string;
//   @IsNumber()
//   firstPlayerScore: number;
//   @IsArray()
//   //@ArrayMinSize(1)
//   @Type(() => String)
//   firstPlayerAnswers: string[];
//   @IsString()
//   @IsUUID()
//   secondPlayerId: string;
//   @IsString()
//   secondPlayerLogin: string;
//   @IsNumber()
//   secondPlayerScore: number;
//   @IsArray()
//   @Type(() => String)
//   secondPlayerAnswers: string[];
//   @IsString()
//   @IsEnum(gameStatusesEnum)
//   status: gameStatusesEnum;
//   @IsString()
//   pairCreatedDate: string;
//   @IsString()
//   startGameDate: string;
//   @IsString()
//   finishGameDate: string;
// }
