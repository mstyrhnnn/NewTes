import { BusserEntity } from '../busser.entity';
export class BusserDetailsDto extends BusserEntity {
  days_late: number;
  late_fee_total: number;
}