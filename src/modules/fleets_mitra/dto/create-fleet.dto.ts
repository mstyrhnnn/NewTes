import { ApiProperty } from '@nestjs/swagger';

export class CreateFleetDto {
  @ApiProperty()
  fleet_name: string;

  @ApiProperty({ required: false, nullable: true })
  driver_id?: number;

  @ApiProperty()
  number_plate: string;

  @ApiProperty()
  color: string;
}
