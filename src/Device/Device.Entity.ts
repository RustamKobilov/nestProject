import { Column, PrimaryColumn } from 'typeorm';

export class DeviceEntity {
  @PrimaryColumn({ type: 'uuid' })
  deviceId: string;
  @Column({ type: 'uuid' })
  userId: string;
  @Column({ type: 'varchar', length: 30 })
  lastActiveDate: string;
  @Column({ type: 'varchar', length: 30 })
  diesAtDate: string;
  @Column({ type: 'varchar', length: 30 })
  title: string;
}
