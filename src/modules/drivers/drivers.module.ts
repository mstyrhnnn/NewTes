import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  controllers: [DriversController],
  providers: [DriversService],
  imports: [UsersModule],
})
export class DriversModule { }
