import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverReimburse } from './entities/driver-reimburse.entity';
import { DriverReimburseService } from './driver_reimburse.service';
import { DriverReimburseController } from './driver_reimburse.controller';
import { UsersModule } from '../users/users.module';
import { LocationsModule } from '../locations/locations.module';
import { StoragesModule } from '../storages/storages.module';
import { FleetsModule } from '../fleets/fleets.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DriverReimburse]),
        UsersModule,
        LocationsModule,
        StoragesModule,
        FleetsModule,
    ],

    controllers: [DriverReimburseController],
    providers: [DriverReimburseService],
    exports: [DriverReimburseService],
})
export class DriverReimburseModule {}
