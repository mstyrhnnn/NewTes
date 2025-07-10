import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from '../orders/entities/orders.entity';
import { BusserStatusEnum } from './enums/busser.status.enum';


@Entity('busser')
export class BusserEntity {

  @Column({
    type: 'enum',
    enum: BusserStatusEnum,
    default: BusserStatusEnum.PERINGATAN,
  })
  status: BusserStatusEnum;

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' }) 
  order: OrderEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  status_updated_at: Date;

  @Column({ nullable: true })
  investigator_id: number;

  @Column({ type: 'text', nullable: true })
  notes: string;
}