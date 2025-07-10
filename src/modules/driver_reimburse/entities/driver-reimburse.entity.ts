import { UserEntity } from 'src/modules/users/entities/user.entity';
import { LocationEntity } from 'src/modules/locations/entities/location.entity';
import { Base } from 'src/common/database/base.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReimburseStatus } from '../enums/reimburse-status.enum';
import { FleetsEntity } from 'src/modules/fleets/entities/fleet.entity';

@Entity({
  name: 'driver_reimburse',
})
export class DriverReimburse extends Base {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Index()
  @Column()
  driver_id: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'driver_id' })
  driver: UserEntity;

  @Column('double precision')
  nominal: number;

  @Column({ name: 'no_rekening' })
  noRekening: string;

  @Column({ name: 'bank' })
  bank: string;

  @ManyToOne(() => LocationEntity)
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Index()
  @Column()
  date: Date;

  @Column('text')
  description: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  rejection_reason: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  rejected_at: Date;

  @Column({
    name: 'transaction_proof_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  transactionProofUrl: string; // Upload driver

  @Index()
  @Column({
    type: 'enum',
    enum: ReimburseStatus,
    default: ReimburseStatus.PENDING,
  })
  status: ReimburseStatus;

  @ManyToOne(() => FleetsEntity)
  @JoinColumn({ name: 'fleet_id' })
  fleet: FleetsEntity;

  @Column({ nullable: true })
  fleet_id: number;
}
