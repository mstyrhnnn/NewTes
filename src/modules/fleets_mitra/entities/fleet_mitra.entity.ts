import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from 'src/common/database/base.entity';

@Entity('fleet_mitra')
export class FleetMitra extends Base {
  @Column()
  fleet_name: string;

  @Column({ nullable: true })
  driver_id: number;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'driver_id' }) 
  driver: UserEntity;

  @Column()
  number_plate: string;

  @Column()
  color: string;

  @Column({ nullable: true, length: 255 })
  photo_profile: string | null;
}
