import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverMitra } from 'src/modules/drivers_mitra/entities/driver_mitra.entity';
import { WaBlasController } from './wa_blas.controller';
import { FleetMitra } from '../fleets_mitra/entities/fleet_mitra.entity';
import { WaBlasService } from './wa_blas.service';
import { QontakModule } from '../qontak/qontak.module';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FleetMitra, DriverMitra, UserEntity]), QontakModule],
  controllers: [WaBlasController], 
  providers: [WaBlasService],
  exports: [WaBlasService],
})
export class WaBlasModule {}
