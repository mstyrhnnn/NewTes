import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FleetMitra } from './entities/fleet_mitra.entity';
import { FleetMitraService } from './fleet_mitra.service';
import { FleetMitraController } from './fleet_mitra.controller';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FleetMitra, UserEntity])],
  controllers: [FleetMitraController],
  providers: [FleetMitraService],
  exports: [FleetMitraService],
})
export class FleetMitraModule {}
