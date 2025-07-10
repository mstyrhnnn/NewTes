import { Module } from '@nestjs/common';
import { FleetsService } from './fleets.service';
import { FleetsController } from './fleets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FleetsEntity } from './entities/fleet.entity';
import { FleetPhotosEntity } from './entities/fleet-photo.entity';
import { UsersModule } from '../users/users.module';
import { DiscountModule } from '../discount/discount.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FleetsEntity,
      FleetPhotosEntity,
    ]),
    UsersModule,
    DiscountModule,
  ],
  controllers: [FleetsController],
  providers: [
    FleetsService
  ],
  exports: [
    FleetsService,
  ]
})
export class FleetsModule { }
