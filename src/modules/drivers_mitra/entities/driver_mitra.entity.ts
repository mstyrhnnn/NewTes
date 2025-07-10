import { Base } from 'src/common/database/base.entity';
import { Column, Entity } from 'typeorm';


@Entity('driver_mitra')
export class DriverMitra extends Base {
  @Column({ name: 'driver_name', type: 'varchar', length: 100 })
  driver_name: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phone_number: string;

  @Column({ name: 'photo_profile', type: 'varchar', length: 255, nullable: true })
  photo_profile: string | null;
}
