import { Module } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { OwnersController } from './owners.controller';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [OwnersController],
  providers: [OwnersService],
  imports: [UsersModule],
})
export class OwnersModule { }
