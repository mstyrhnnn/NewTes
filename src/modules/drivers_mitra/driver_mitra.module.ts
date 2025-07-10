import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverMitraService } from './driver_mitra.service';
import { DriverMitraController } from './driver_mitra.controller';
import { DriverMitra } from './entities/driver_mitra.entity';
import { FleetMitra } from '../fleets_mitra/entities/fleet_mitra.entity';
import { UserEntity } from '../users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DriverMitra, FleetMitra, UserEntity])],
  controllers: [DriverMitraController],
  providers: [DriverMitraService],
})
export class DriverMitraModule {}
