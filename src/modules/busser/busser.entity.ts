import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from '../orders/entities/orders.entity';

export enum BusserStatusEnum {
  PERINGATAN = 'peringatan',
  BUTUH_TINDAKAN = 'butuh_tindakan',
  URGENT = 'urgent',
  TINDAK_LANJUT = 'tindak_lanjut',
  SELESAI = 'selesai',
}

@Entity('busser')
export class BusserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' }) 
  order: OrderEntity;

  @Column({
    type: 'enum',
    enum: BusserStatusEnum,
    default: BusserStatusEnum.PERINGATAN,
  })
  status: BusserStatusEnum;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  status_updated_at: Date;

  @Column({ nullable: true })
  investigator_id: number;

  @Column({ type: 'text', nullable: true })
  notes: string;
}