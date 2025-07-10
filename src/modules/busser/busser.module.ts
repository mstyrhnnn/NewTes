import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusserService } from './busser.service';
import { BusserController } from './busser.controller';
import { OrderEntity } from '../orders/entities/orders.entity';
import { BusserEntity } from './busser.entity';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, BusserEntity]), TaskModule],
  providers: [BusserService],
  controllers: [BusserController],
})
export class BusserModule {}