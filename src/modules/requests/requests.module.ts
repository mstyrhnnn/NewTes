import { Module } from '@nestjs/common';
import { RequestsService } from './services/requests.service';
import { RequestsController } from './requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsEntity } from './entities/request.entity';
import { RequestLogsEntity } from './entities/request-log.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      RequestsEntity,
      RequestLogsEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule { }
